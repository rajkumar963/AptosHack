import React from 'react';
import { TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { GlassCard } from './GlassCard';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardStats, apyHistory } from '../data/mockData';

const formatNumber = (num: number) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-900">
        <StatCard
          title="Total Value Locked"
          value={formatNumber(dashboardStats.totalTVL)}
          change="+12.5%"
          icon="💰"
          gradient="from-purple-500 to-blue-500"
        />
        <StatCard
          title="Active Vaults"
          value={dashboardStats.totalVaults.toString()}
          change="+3"
          icon="🏦"
          gradient="from-blue-500 to-green-500"
        />
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          change="+8.3%"
          icon="👥"
          gradient="from-green-500 to-purple-500"
        />
        <StatCard
          title="Daily Earnings"
          value={formatNumber(dashboardStats.dailyEarnings)}
          change="+15.2%"
          icon="📈"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Average APY Trend</h3>
              <div className="flex items-center space-x-2 text-green-400">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">+2.3% this week</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apyHistory}>
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
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Average APY</span>
                <span className="text-green-400 font-semibold">{dashboardStats.averageAPY}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Best Performing</span>
                <span className="text-purple-400 font-semibold">ARB-ETH LP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">New Vaults</span>
                <span className="text-blue-400 font-semibold">3 this week</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Risk Level</span>
                <span className="text-yellow-400 font-semibold">Medium</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Deposit', amount: '$12,450', vault: 'USDC-ETH LP', time: '2 min ago' },
                { action: 'Withdraw', amount: '$8,200', vault: 'BNB-BUSD', time: '5 min ago' },
                { action: 'Deposit', amount: '$25,000', vault: 'MATIC Staking', time: '12 min ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{activity.action} • {activity.vault}</p>
                    <p className="text-white/50 text-xs">{activity.time}</p>
                  </div>
                  <span className="text-green-400 font-semibold">{activity.amount}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};