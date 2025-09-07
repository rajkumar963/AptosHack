import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Zap, DollarSign } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Vault } from '../types';

interface VaultDetailsProps {
  vault: Vault;
  onBack: () => void;
}

const mockApyData = [
  { date: '2024-01-01', apy: 15.2 },
  { date: '2024-01-07', apy: 18.3 },
  { date: '2024-01-14', apy: 22.1 },
  { date: '2024-01-21', apy: 25.8 },
  { date: '2024-01-28', apy: 24.5 },
];

export const VaultDetails: React.FC<VaultDetailsProps> = ({ vault, onBack }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'medium': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400';
      case 'high': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-3xl border border-white/10">
            {vault.logo}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{vault.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{vault.chain.logo}</span>
                <span className="text-white/70">{vault.chain.name}</span>
              </div>
              <div className={`px-3 py-1 rounded-full border bg-gradient-to-r ${getRiskColor(vault.riskLevel)}`}>
                <span className="text-sm font-medium">
                  {vault.riskLevel.charAt(0).toUpperCase() + vault.riskLevel.slice(1)} Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
            <TrendingUp size={24} className="text-green-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm">Current APY</p>
            <p className="text-2xl font-bold text-green-400">{vault.apy}%</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
            <DollarSign size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm">Total TVL</p>
            <p className="text-2xl font-bold text-white">{formatNumber(vault.tvl)}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Zap size={24} className="text-purple-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm">Compound Freq</p>
            <p className="text-lg font-semibold text-white">{vault.compoundFreq}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30">
            <Shield size={24} className="text-orange-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm">Withdraw Fee</p>
            <p className="text-lg font-semibold text-white">{vault.withdrawFee}%</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">APY Performance</h3>
              <div className="flex items-center space-x-2 text-green-400">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">+9.3% this month</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockApyData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="apy" 
                    stroke="url(#gradient)"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">Strategy Details</h3>
            <div className="space-y-4">
              <p className="text-white/80">{vault.strategy}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Deposit Fee</p>
                  <p className="text-white font-semibold">{vault.depositFee}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Withdraw Fee</p>
                  <p className="text-white font-semibold">{vault.withdrawFee}%</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">Deposit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Amount ({vault.asset})</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                />
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Balance: 1,234.56 {vault.asset}</span>
                <button className="text-purple-400 hover:text-purple-300">MAX</button>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                Deposit
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">Withdraw</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Amount ({vault.asset})</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
                />
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Deposited: 567.89 {vault.asset}</span>
                <button className="text-purple-400 hover:text-purple-300">MAX</button>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-red-500/80 to-pink-500/80 rounded-xl text-white font-semibold hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                Withdraw
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Your Position</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Deposited</span>
                <span className="text-white font-semibold">567.89 {vault.asset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Current Value</span>
                <span className="text-white font-semibold">$12,456.78</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Earned</span>
                <span className="text-green-400 font-semibold">+$1,234.56</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">APY</span>
                <span className="text-green-400 font-semibold">{vault.apy}%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};