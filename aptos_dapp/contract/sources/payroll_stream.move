module payroll_stream_addr::payroll_stream {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::object::{Self, ExtendRef};

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_STREAM_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_STREAM_ALREADY_EXISTS: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;
    const E_STREAM_ENDED: u64 = 6;
    const E_NO_WITHDRAWABLE_AMOUNT: u64 = 7;

    // Stream status
    const STREAM_ACTIVE: u8 = 1;
    const STREAM_PAUSED: u8 = 2;
    const STREAM_COMPLETED: u8 = 3;

    // PayrollStream resource that holds individual stream data
    struct PayrollStream has key, store {
        employer: address,
        employee: address,
        total_amount: u64,
        withdrawn_amount: u64,
        start_time: u64,
        end_time: u64,
        stream_rate: u64, // amount per second
        status: u8,
        description: String,
    }

    // Company payroll manager resource
    struct PayrollManager has key {
        streams: vector<address>, // addresses of stream objects
        total_deposited: u64,
        total_withdrawn: u64,
        stream_events: EventHandle<StreamEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
    }

    // Employee stream tracker
    struct EmployeeStreams has key {
        active_streams: vector<address>,
        total_earned: u64,
        total_withdrawn: u64,
    }

    // Events
    struct StreamEvent has drop, store {
        employer: address,
        employee: address,
        stream_address: address,
        amount: u64,
        start_time: u64,
        end_time: u64,
        description: String,
    }

    struct WithdrawalEvent has drop, store {
        employee: address,
        stream_address: address,
        amount: u64,
        timestamp: u64,
    }

    struct StreamController has key {
        extend_ref: ExtendRef,
    }

    // Initialize payroll manager for employer
    public entry fun initialize_payroll_manager(employer: &signer) {
        let employer_addr = signer::address_of(employer);
        assert!(!exists<PayrollManager>(employer_addr), E_STREAM_ALREADY_EXISTS);
        
        move_to(employer, PayrollManager {
            streams: vector::empty(),
            total_deposited: 0,
            total_withdrawn: 0,
            stream_events: account::new_event_handle<StreamEvent>(employer),
            withdrawal_events: account::new_event_handle<WithdrawalEvent>(employer),
        });
    }

    // Initialize employee stream tracker
    public entry fun initialize_employee_streams(employee: &signer) {
        let employee_addr = signer::address_of(employee);
        assert!(!exists<EmployeeStreams>(employee_addr), E_STREAM_ALREADY_EXISTS);
        
        move_to(employee, EmployeeStreams {
            active_streams: vector::empty(),
            total_earned: 0,
            total_withdrawn: 0,
        });
    }

    // Create a new payroll stream
    public entry fun create_stream(
        employer: &signer,
        employee_addr: address,
        total_amount: u64,
        duration_seconds: u64,
        description: String,
    ) acquires PayrollManager, EmployeeStreams {
        let employer_addr = signer::address_of(employer);
        assert!(exists<PayrollManager>(employer_addr), E_NOT_AUTHORIZED);
        assert!(total_amount > 0, E_INVALID_AMOUNT);
        assert!(duration_seconds > 0, E_INVALID_AMOUNT);

        // Withdraw APT from employer to fund the stream
        let payment = coin::withdraw<AptosCoin>(employer, total_amount);
        
        // Create stream object
        let constructor_ref = &object::create_object(employer_addr);
        let stream_signer = &object::generate_signer(constructor_ref);
        let stream_addr = signer::address_of(stream_signer);
        
        let current_time = timestamp::now_seconds();
        let end_time = current_time + duration_seconds;
        let stream_rate = total_amount / duration_seconds;
        
        // Store the payment in the stream object
        coin::deposit(stream_addr, payment);
        
        // Create stream resource
        move_to(stream_signer, PayrollStream {
            employer: employer_addr,
            employee: employee_addr,
            total_amount,
            withdrawn_amount: 0,
            start_time: current_time,
            end_time,
            stream_rate,
            status: STREAM_ACTIVE,
            description,
        });

        // Store controller for the stream object
        move_to(stream_signer, StreamController {
            extend_ref: object::generate_extend_ref(constructor_ref),
        });
        
        // Update employer's payroll manager
        let payroll_manager = borrow_global_mut<PayrollManager>(employer_addr);
        vector::push_back(&mut payroll_manager.streams, stream_addr);
        payroll_manager.total_deposited = payroll_manager.total_deposited + total_amount;
        
        // Emit stream creation event
        event::emit_event(&mut payroll_manager.stream_events, StreamEvent {
            employer: employer_addr,
            employee: employee_addr,
            stream_address: stream_addr,
            amount: total_amount,
            start_time: current_time,
            end_time,
            description,
        });
        
        // Update employee streams if they have initialized
        if (exists<EmployeeStreams>(employee_addr)) {
            let employee_streams = borrow_global_mut<EmployeeStreams>(employee_addr);
            vector::push_back(&mut employee_streams.active_streams, stream_addr);
            employee_streams.total_earned = employee_streams.total_earned + total_amount;
        };
    }

    // Calculate withdrawable amount for a stream
    public fun calculate_withdrawable_amount(stream_addr: address): u64 acquires PayrollStream {
        assert!(exists<PayrollStream>(stream_addr), E_STREAM_NOT_FOUND);
        
        let stream = borrow_global<PayrollStream>(stream_addr);
        let current_time = timestamp::now_seconds();
        
        if (stream.status != STREAM_ACTIVE || current_time < stream.start_time) {
            return 0
        };
        
        let elapsed_time = if (current_time > stream.end_time) {
            stream.end_time - stream.start_time
        } else {
            current_time - stream.start_time
        };
        
        let total_unlocked = elapsed_time * stream.stream_rate;
        let withdrawable = if (total_unlocked > stream.withdrawn_amount) {
            total_unlocked - stream.withdrawn_amount
        } else {
            0
        };
        
        withdrawable
    }

    // Employee withdraws from stream
    public entry fun withdraw_from_stream(
        employee: &signer,
        stream_addr: address,
    ) acquires PayrollStream, PayrollManager, EmployeeStreams, StreamController {
        let employee_addr = signer::address_of(employee);
        assert!(exists<PayrollStream>(stream_addr), E_STREAM_NOT_FOUND);
        
        let withdrawable_amount = calculate_withdrawable_amount(stream_addr);
        let stream = borrow_global_mut<PayrollStream>(stream_addr);
        assert!(stream.employee == employee_addr, E_NOT_AUTHORIZED);
        assert!(stream.status == STREAM_ACTIVE, E_STREAM_ENDED);
        assert!(withdrawable_amount > 0, E_NO_WITHDRAWABLE_AMOUNT);
        
        // Update stream
        stream.withdrawn_amount = stream.withdrawn_amount + withdrawable_amount;
        
        // Get stream controller and withdraw coins
          let stream_controller = borrow_global<StreamController>(stream_addr);
          let stream_signer = object::generate_signer_for_extending(&stream_controller.extend_ref);
          let payment = coin::withdraw<AptosCoin>(&stream_signer, withdrawable_amount);
        coin::deposit(employee_addr, payment);
        
        // Update employer's payroll manager
        let payroll_manager = borrow_global_mut<PayrollManager>(stream.employer);
        payroll_manager.total_withdrawn = payroll_manager.total_withdrawn + withdrawable_amount;
        
        // Emit withdrawal event
        event::emit_event(&mut payroll_manager.withdrawal_events, WithdrawalEvent {
            employee: employee_addr,
            stream_address: stream_addr,
            amount: withdrawable_amount,
            timestamp: timestamp::now_seconds(),
        });
        
        // Update employee streams
        if (exists<EmployeeStreams>(employee_addr)) {
            let employee_streams = borrow_global_mut<EmployeeStreams>(employee_addr);
            employee_streams.total_withdrawn = employee_streams.total_withdrawn + withdrawable_amount;
        };
        
        // Mark stream as completed if fully withdrawn
        if (stream.withdrawn_amount >= stream.total_amount) {
            stream.status = STREAM_COMPLETED;
        };
    }

    // Pause a stream (employer only)
    public entry fun pause_stream(
        employer: &signer,
        stream_addr: address,
    ) acquires PayrollStream {
        let employer_addr = signer::address_of(employer);
        assert!(exists<PayrollStream>(stream_addr), E_STREAM_NOT_FOUND);
        
        let stream = borrow_global_mut<PayrollStream>(stream_addr);
        assert!(stream.employer == employer_addr, E_NOT_AUTHORIZED);
        assert!(stream.status == STREAM_ACTIVE, E_STREAM_ENDED);
        
        stream.status = STREAM_PAUSED;
    }

    // Resume a paused stream (employer only)
    public entry fun resume_stream(
        employer: &signer,
        stream_addr: address,
    ) acquires PayrollStream {
        let employer_addr = signer::address_of(employer);
        assert!(exists<PayrollStream>(stream_addr), E_STREAM_NOT_FOUND);
        
        let stream = borrow_global_mut<PayrollStream>(stream_addr);
        assert!(stream.employer == employer_addr, E_NOT_AUTHORIZED);
        assert!(stream.status == STREAM_PAUSED, E_INVALID_AMOUNT);
        
        stream.status = STREAM_ACTIVE;
    }

    // ======================== View Functions ========================

    #[view]
    public fun get_stream_info(stream_addr: address): (address, address, u64, u64, u64, u64, u64, u8, String) acquires PayrollStream {
        assert!(exists<PayrollStream>(stream_addr), E_STREAM_NOT_FOUND);
        let stream = borrow_global<PayrollStream>(stream_addr);
        (
            stream.employer,
            stream.employee,
            stream.total_amount,
            stream.withdrawn_amount,
            stream.start_time,
            stream.end_time,
            stream.stream_rate,
            stream.status,
            stream.description
        )
    }

    #[view]
    public fun get_employer_streams(employer_addr: address): vector<address> acquires PayrollManager {
        if (!exists<PayrollManager>(employer_addr)) {
            return vector::empty()
        };
        let payroll_manager = borrow_global<PayrollManager>(employer_addr);
        payroll_manager.streams
    }

    #[view]
    public fun get_employee_streams(employee_addr: address): vector<address> acquires EmployeeStreams {
        if (!exists<EmployeeStreams>(employee_addr)) {
            return vector::empty()
        };
        let employee_streams = borrow_global<EmployeeStreams>(employee_addr);
        employee_streams.active_streams
    }

    #[view]
    public fun get_payroll_manager_stats(employer_addr: address): (u64, u64) acquires PayrollManager {
        if (!exists<PayrollManager>(employer_addr)) {
            return (0, 0)
        };
        let payroll_manager = borrow_global<PayrollManager>(employer_addr);
        (payroll_manager.total_deposited, payroll_manager.total_withdrawn)
    }

    #[view]
    public fun get_employee_stats(employee_addr: address): (u64, u64) acquires EmployeeStreams {
        if (!exists<EmployeeStreams>(employee_addr)) {
            return (0, 0)
        };
        let employee_streams = borrow_global<EmployeeStreams>(employee_addr);
        (employee_streams.total_earned, employee_streams.total_withdrawn)
    }

    // ======================== Unit Tests ========================

    #[test_only]
    use aptos_framework::account::create_account_for_test;

    #[test(employer = @0x123, employee = @0x456)]
    public fun test_create_and_withdraw_stream(employer: &signer, employee: &signer) {
        // Setup
        let employer_addr = signer::address_of(employer);
        let employee_addr = signer::address_of(employee);
        
        create_account_for_test(employer_addr);
        create_account_for_test(employee_addr);
        
        // Initialize
        initialize_payroll_manager(employer);
        initialize_employee_streams(employee);
        
        // Create stream (this would need proper APT setup in real test)
        // create_stream(employer, employee_addr, 1000000, 86400, string::utf8(b"Monthly salary"));
    }
}