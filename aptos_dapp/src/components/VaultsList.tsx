import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { vaults, chains } from '../data/mockData';
import { Vault } from '../types';

interface VaultsListProps {
  onVaultSelect: (vault: Vault) => void;
}

export const VaultsList: React.FC<VaultsListProps> = ({ onVaultSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl'>('apy');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredVaults = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    let filtered = vaults.filter(vault => {
      const matchesSearch =
        vault.name.toLowerCase().includes(lowerSearch) ||
        vault.asset.toLowerCase().includes(lowerSearch);

      const matchesChain = selectedChain === 'all' || vault.chain.id === selectedChain;
      return matchesSearch && matchesChain;
    });

    filtered.sort((a, b) => {
      const aValue = sortBy === 'apy' ? a.apy : a.tvl;
      const bValue = sortBy === 'apy' ? b.apy : b.tvl;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [searchTerm, selectedChain, sortBy, sortOrder]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-white">Yield Vaults</h2>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
            />
          </div>
          
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/20 transition-all duration-300"
          >
            <option value="all">All Chains</option>
            {chains.map(chain => (
              <option key={chain.id} value={chain.id} className="bg-gray-800">
                {chain.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Sort by {sortBy.toUpperCase()}</span>
            {sortOrder === 'desc' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          </button>
        </div>
      </div>

      {/* Vaults List */}
      <div className="grid gap-4">
        {filteredVaults.map(vault => (
          <GlassCard key={vault.id} className="cursor-pointer group">
            <div 
              className="flex items-center justify-between"
              onClick={() => onVaultSelect(vault)}
            >
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl border border-white/10">
                  {vault.logo}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">{vault.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/20">
                      {vault.asset}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{vault.chain.logo}</span>
                      <span className="text-white/60 text-sm">{vault.chain.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${getRiskColor(vault.riskLevel)}`}>
                      {vault.riskLevel.charAt(0).toUpperCase() + vault.riskLevel.slice(1)} Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">{vault.apy}%</p>
                  <p className="text-white/60 text-sm">APY</p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{formatNumber(vault.tvl)}</p>
                  <p className="text-white/60 text-sm">TVL</p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    vault.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {vault.status.charAt(0).toUpperCase() + vault.status.slice(1)}
                  </span>
                  <p className="text-white/60 text-sm mt-1">{vault.compoundFreq}</p>
                </div>

                <ChevronRight className="text-white/40 group-hover:text-purple-400 transition-colors duration-300" size={20} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredVaults.length === 0 && (
        <GlassCard className="text-center py-12">
          <p className="text-white/60 text-lg">No vaults found matching your criteria</p>
          <p className="text-white/40 text-sm mt-2">Try adjusting your search or filters</p>
        </GlassCard>
      )}
    </div>
  );
};