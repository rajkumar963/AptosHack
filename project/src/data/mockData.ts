import { Chain, Vault, DashboardStats } from '../types';

export const chains: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', logo: '⟠', color: '#627EEA' },
  { id: 'bsc', name: 'BNB Chain', logo: '⚡', color: '#F3BA2F' },
  { id: 'polygon', name: 'Polygon', logo: '⬟', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', logo: '◆', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', logo: '●', color: '#FF0420' },
  { id: 'avalanche', name: 'Avalanche', logo: '▲', color: '#E84142' },
  { id: 'fantom', name: 'Fantom', logo: '♦', color: '#1969FF' },
];

export const vaults: Vault[] = [
  {
    id: '1',
    name: 'USDC-ETH LP',
    asset: 'USDC-ETH',
    logo: '💎',
    chain: chains[0],
    apy: 24.5,
    tvl: 15420000,
    strategy: 'Uniswap V3 LP + Auto-compound',
    status: 'active',
    riskLevel: 'medium',
    depositFee: 0,
    withdrawFee: 0.1,
    compoundFreq: '4x daily'
  },
  {
    id: '2',
    name: 'BNB-BUSD Farm',
    asset: 'BNB-BUSD',
    logo: '🌾',
    chain: chains[1],
    apy: 18.7,
    tvl: 8930000,
    strategy: 'PancakeSwap Yield Farm',
    status: 'active',
    riskLevel: 'low',
    depositFee: 0,
    withdrawFee: 0.1,
    compoundFreq: '2x daily'
  },
  {
    id: '3',
    name: 'MATIC Staking',
    asset: 'MATIC',
    logo: '🔷',
    chain: chains[2],
    apy: 12.3,
    tvl: 22100000,
    strategy: 'Polygon Staking Rewards',
    status: 'active',
    riskLevel: 'low',
    depositFee: 0,
    withdrawFee: 0,
    compoundFreq: 'Daily'
  },
  {
    id: '4',
    name: 'ARB-ETH LP',
    asset: 'ARB-ETH',
    logo: '🚀',
    chain: chains[3],
    apy: 31.2,
    tvl: 5670000,
    strategy: 'Camelot DEX LP + Rewards',
    status: 'active',
    riskLevel: 'high',
    depositFee: 0,
    withdrawFee: 0.25,
    compoundFreq: '6x daily'
  },
  {
    id: '5',
    name: 'OP Yield Farm',
    asset: 'OP-USDC',
    logo: '🎯',
    chain: chains[4],
    apy: 19.8,
    tvl: 3240000,
    strategy: 'Velodrome V2 Farming',
    status: 'active',
    riskLevel: 'medium',
    depositFee: 0,
    withdrawFee: 0.1,
    compoundFreq: '3x daily'
  },
  {
    id: '6',
    name: 'AVAX-USDC',
    asset: 'AVAX-USDC',
    logo: '❄️',
    chain: chains[5],
    apy: 16.4,
    tvl: 7890000,
    strategy: 'Trader Joe Liquidity Mining',
    status: 'active',
    riskLevel: 'medium',
    depositFee: 0,
    withdrawFee: 0.1,
    compoundFreq: '2x daily'
  },
  {
    id: '7',
    name: 'FTM-ETH Bridge',
    asset: 'FTM-ETH',
    logo: '🌉',
    chain: chains[6],
    apy: 28.9,
    tvl: 1230000,
    strategy: 'SpookySwap LP + BOO Rewards',
    status: 'active',
    riskLevel: 'high',
    depositFee: 0,
    withdrawFee: 0.2,
    compoundFreq: '4x daily'
  },
  {
    id: '8',
    name: 'WETH Vault',
    asset: 'WETH',
    logo: '⟠',
    chain: chains[0],
    apy: 8.5,
    tvl: 45600000,
    strategy: 'Lido Staking + Compound',
    status: 'active',
    riskLevel: 'low',
    depositFee: 0,
    withdrawFee: 0.05,
    compoundFreq: 'Daily'
  },
];

export const dashboardStats: DashboardStats = {
  totalTVL: 110140000,
  totalVaults: 247,
  totalUsers: 89350,
  dailyEarnings: 180000,
  averageAPY: 19.8
};

export const apyHistory = [
  { date: '2024-01-01', apy: 15.2 },
  { date: '2024-01-07', apy: 17.8 },
  { date: '2024-01-14', apy: 19.4 },
  { date: '2024-01-21', apy: 22.1 },
  { date: '2024-01-28', apy: 18.9 },
  { date: '2024-02-04', apy: 20.3 },
  { date: '2024-02-11', apy: 24.5 },
];