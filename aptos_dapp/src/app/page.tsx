"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { VaultsList } from '@/components/VaultsList';
import { VaultDetails } from '@/components/VaultDetails';
import { Vault } from '@/types';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  const handleVaultSelect = (vault: Vault) => {
    setSelectedVault(vault);
    setActiveTab('vault-details');
  };

  const handleBackToVaults = () => {
    setSelectedVault(null);
    setActiveTab('vaults');
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">To get started Connect a wallet</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="ml-20">
        <Header />
        
        <main className="p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'vaults' && <VaultsList onVaultSelect={handleVaultSelect} />}
          {activeTab === 'vault-details' && selectedVault && (
            <VaultDetails vault={selectedVault} onBack={handleBackToVaults} />
          )}
          {activeTab === 'analytics' && (
            <div className="text-center text-white/60 py-20">
              <h2 className="text-2xl font-bold mb-4">Analytics Coming Soon</h2>
              <p>Advanced analytics and reporting features will be available here.</p>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="text-center text-white/60 py-20">
              <h2 className="text-2xl font-bold mb-4">Security Overview Coming Soon</h2>
              <p>Security audits, risk assessments, and safety metrics will be displayed here.</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center text-white/60 py-20">
              <h2 className="text-2xl font-bold mb-4">Settings Coming Soon</h2>
              <p>User preferences, notifications, and account settings will be available here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
