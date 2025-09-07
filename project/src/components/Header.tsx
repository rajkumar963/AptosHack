import React from 'react';
import {  User } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { WalletConnect } from './WalletConnect';

export const Header: React.FC = () => {
  const handleConnect = (address: string) => {
    console.log('Connected wallet address:', address);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="flex items-center justify-between p-4">
        <div  className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent">
            DeFi Vault
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">


          <button  className=" rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300">
           <WalletConnect onConnect={handleConnect} />
          </button>
          
          <GlassCard className="!p-2" hover={false}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white/80 text-sm font-medium">0x1234...5678</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </header>
  );
};