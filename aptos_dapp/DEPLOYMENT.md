# Deployment Guide

## Prerequisites

1. **Aptos CLI**: Install the Aptos CLI

   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Node.js**: Version 18 or higher

   ```bash
   node --version
   ```

3. **Aptos Account**: Create an account for deployment
   ```bash
   aptos init --profile deployer
   ```

## Environment Setup

1. **Create environment file**

   ```bash
   cp .env.example .env.local
   ```

2. **Update environment variables**

   ```env
   NEXT_PUBLIC_APP_NETWORK=testnet
   NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0x...
   NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=0x...
   ```

3. **Fund your account** (for testnet)
   ```bash
   aptos account fund-with-faucet --profile deployer
   ```

## Smart Contract Deployment

1. **Compile contracts**

   ```bash
   cd contract
   aptos move compile --dev
   ```

2. **Run tests**

   ```bash
   aptos move test
   ```

3. **Deploy contracts**

   ```bash
   cd ..
   npm run deploy:contracts
   ```

4. **Verify deployment**
   - Check the console output for the deployed address
   - Verify the address is updated in `.env.local`

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_APP_NETWORK`
   - `NEXT_PUBLIC_PAYROLL_STREAM_ADDRESS`
   - `NEXT_PUBLIC_MESSAGE_BOARD_ADDRESS`

### Option 2: Netlify

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `out`

### Option 3: Self-hosted

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Verification

1. **Check smart contracts**
   - Visit Aptos Explorer
   - Search for your deployed address
   - Verify contract functions are available

2. **Test frontend**
   - Connect wallet
   - Initialize accounts
   - Create test streams
   - Test withdrawal functionality

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check account balance
   - Verify network configuration
   - Check for compilation errors

2. **Frontend can't connect to contracts**
   - Verify contract addresses in `.env.local`
   - Check network configuration
   - Ensure contracts are deployed

3. **Wallet connection issues**
   - Check wallet extension is installed
   - Verify network settings
   - Clear browser cache

### Support

- Check Aptos documentation
- Join Aptos Discord
- Create GitHub issue
