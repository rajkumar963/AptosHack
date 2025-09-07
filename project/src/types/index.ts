export interface Chain {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface Vault {
  id: string;
  name: string;
  asset: string;
  logo: string;
  chain: Chain;
  apy: number;
  tvl: number;
  strategy: string;
  status: 'active' | 'paused' | 'retired';
  riskLevel: 'low' | 'medium' | 'high';
  depositFee: number;
  withdrawFee: number;
  compoundFreq: string;
}

export interface DashboardStats {
  totalTVL: number;
  totalVaults: number;
  totalUsers: number;
  dailyEarnings: number;
  averageAPY: number;
}