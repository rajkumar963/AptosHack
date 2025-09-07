# Aptos Payroll Streaming DApp

A comprehensive decentralized application built on Aptos blockchain for managing payroll streams between employers and employees.

## 🚀 Features

### For Employers

- **Initialize Payroll Manager**: Set up your account to create and manage payroll streams
- **Create Streams**: Create time-based salary streams for employees
- **Stream Management**: Pause, resume, and monitor active streams
- **Analytics Dashboard**: Track total deposits, active streams, and withdrawals
- **Real-time Monitoring**: Live updates of stream status and progress

### For Employees

- **Initialize Employee Account**: Set up your account to receive payroll streams
- **Withdraw Funds**: Withdraw available funds from active streams
- **Stream Tracking**: Monitor all your active and completed streams
- **Earnings Dashboard**: View total earned and withdrawn amounts
- **Real-time Updates**: Live updates of available withdrawal amounts

### Technical Features

- **Smart Contract Integration**: Full integration with Aptos Move smart contracts
- **Wallet Integration**: Support for multiple Aptos wallets
- **Real-time Data**: Automatic refresh of stream data and balances
- **Responsive UI**: Modern, mobile-friendly interface
- **Error Handling**: Comprehensive error handling and user feedback
- **Transaction Management**: Secure transaction signing and confirmation

## 🏗️ Architecture

### Smart Contracts

- **PayrollStream**: Main contract for managing payroll streams
- **MessageBoard**: Simple message board for communication
- **Object-based Design**: Uses Aptos objects for stream management

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Aptos Wallet Adapter**: Wallet integration
- **Surf SDK**: Aptos blockchain interaction

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aptos_dapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_APP_NETWORK=testnet
   NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0x...
   NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=0x...
   NEXT_PUBLIC_PAYROLL_STREAM_ADDRESS=0x...
   NEXT_PUBLIC_MESSAGE_BOARD_ADDRESS=0x...
   ```

4. **Deploy smart contracts**

   ```bash
   npm run deploy:contracts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Smart Contract Development

```bash
# Compile contracts
cd contract
aptos move compile --dev

# Run tests
aptos move test

# Deploy contracts
node ../scripts/move/publish_payroll.js
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Usage

### For Employers

1. **Connect Wallet**: Connect your Aptos wallet to the application
2. **Initialize Account**: Click "Initialize Employer Account" to set up your payroll manager
3. **Create Streams**:
   - Enter employee address
   - Set amount in APT
   - Set duration in days
   - Add description
   - Click "Create Stream"
4. **Manage Streams**: View, pause, resume, or monitor your created streams

### For Employees

1. **Connect Wallet**: Connect your Aptos wallet to the application
2. **Initialize Account**: Click "Initialize Employee Account" to set up your employee profile
3. **View Streams**: See all streams created for you by employers
4. **Withdraw Funds**: Withdraw available funds from active streams
5. **Track Earnings**: Monitor your total earned and withdrawn amounts

## 🔒 Security Features

- **Smart Contract Security**: Audited Move smart contracts
- **Wallet Integration**: Secure transaction signing
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Graceful error handling and user feedback
- **Access Control**: Proper authorization checks for all operations

## 🌐 Network Support

- **Testnet**: Development and testing
- **Mainnet**: Production deployment
- **Devnet**: Local development

## 📊 Smart Contract Functions

### Employer Functions

- `initialize_payroll_manager()`: Initialize employer account
- `create_stream()`: Create new payroll stream
- `pause_stream()`: Pause active stream
- `resume_stream()`: Resume paused stream

### Employee Functions

- `initialize_employee_streams()`: Initialize employee account
- `withdraw_from_stream()`: Withdraw available funds

### View Functions

- `get_stream_info()`: Get detailed stream information
- `get_employer_streams()`: Get all employer's streams
- `get_employee_streams()`: Get all employee's streams
- `calculate_withdrawable_amount()`: Calculate available withdrawal amount
- `get_payroll_manager_stats()`: Get employer statistics
- `get_employee_stats()`: Get employee statistics

## 🚀 Deployment

### Smart Contract Deployment

```bash
# Deploy to testnet
aptos move publish --profile testnet

# Deploy to mainnet
aptos move publish --profile mainnet
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy

# Deploy to other platforms
# Follow platform-specific deployment instructions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Join the Aptos Discord community

## 🔄 Updates

- **v1.0.0**: Initial release with basic payroll streaming
- **v1.1.0**: Enhanced UI with real-time updates
- **v1.2.0**: Added comprehensive analytics and monitoring

---

Built with ❤️ on Aptos blockchain
