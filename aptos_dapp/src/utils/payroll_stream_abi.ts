export const PAYROLL_STREAM_ABI = {
  address: "0x100", // Dev address - will be updated after deployment
  name: "payroll_stream",
  friends: [],
  exposed_functions: [
    {
      name: "initialize_payroll_manager",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer"],
      return: []
    },
    {
      name: "initialize_employee_streams",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer"],
      return: []
    },
    {
      name: "create_stream",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address", "u64", "u64", "0x1::string::String"],
      return: []
    },
    {
      name: "withdraw_from_stream",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address"],
      return: []
    },
    {
      name: "pause_stream",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address"],
      return: []
    },
    {
      name: "resume_stream",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["&signer", "address"],
      return: []
    },
    {
      name: "calculate_withdrawable_amount",
      visibility: "public",
      is_entry: false,
      is_view: false,
      generic_type_params: [],
      params: ["address"],
      return: ["u64"]
    },
    {
      name: "get_stream_info",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["address", "address", "u64", "u64", "u64", "u64", "u64", "u8", "0x1::string::String"]
    },
    {
      name: "get_employer_streams",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["vector<address>"]
    },
    {
      name: "get_employee_streams",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["vector<address>"]
    },
    {
      name: "get_payroll_manager_stats",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u64", "u64"]
    },
    {
      name: "get_employee_stats",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"],
      return: ["u64", "u64"]
    }
  ],
  structs: [
    {
      name: "PayrollStream",
      is_native: false,
      abilities: ["key", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "employer",
          type: "address"
        },
        {
          name: "employee",
          type: "address"
        },
        {
          name: "total_amount",
          type: "u64"
        },
        {
          name: "withdrawn_amount",
          type: "u64"
        },
        {
          name: "start_time",
          type: "u64"
        },
        {
          name: "end_time",
          type: "u64"
        },
        {
          name: "stream_rate",
          type: "u64"
        },
        {
          name: "status",
          type: "u8"
        },
        {
          name: "description",
          type: "0x1::string::String"
        }
      ]
    },
    {
      name: "StreamEvent",
      is_native: false,
      abilities: ["drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "employer",
          type: "address"
        },
        {
          name: "employee",
          type: "address"
        },
        {
          name: "stream_address",
          type: "address"
        },
        {
          name: "amount",
          type: "u64"
        },
        {
          name: "start_time",
          type: "u64"
        },
        {
          name: "end_time",
          type: "u64"
        },
        {
          name: "description",
          type: "0x1::string::String"
        }
      ]
    },
    {
      name: "WithdrawalEvent",
      is_native: false,
      abilities: ["drop", "store"],
      generic_type_params: [],
      fields: [
        {
          name: "employee",
          type: "address"
        },
        {
          name: "stream_address",
          type: "address"
        },
        {
          name: "amount",
          type: "u64"
        },
        {
          name: "timestamp",
          type: "u64"
        }
      ]
    }
  ]
} as const;

// Stream status constants
export const STREAM_STATUS = {
  ACTIVE: 1,
  PAUSED: 2,
  COMPLETED: 3,
} as const;

// Helper types
export interface PayrollStreamInfo {
  employer: string;
  employee: string;
  totalAmount: string;
  withdrawnAmount: string;
  startTime: string;
  endTime: string;
  streamRate: string;
  status: number;
  description: string;
}

export interface StreamEvent {
  employer: string;
  employee: string;
  streamAddress: string;
  amount: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface WithdrawalEvent {
  employee: string;
  streamAddress: string;
  amount: string;
  timestamp: string;
}

export interface PayrollStats {
  totalDeposited: string;
  totalWithdrawn: string;
}

export interface EmployeeStats {
  totalEarned: string;
  totalWithdrawn: string;
}