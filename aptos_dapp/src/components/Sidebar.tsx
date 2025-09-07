import React from 'react';
import { BarChart3, Wallet, Settings, TrendingUp, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'vaults', icon: Wallet, label: 'Vaults' },
  { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-20 backdrop-blur-md bg-black/20 border-r border-white/10 z-50">
      <div className="flex flex-col items-center py-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mb-8">
          <span className="text-2xl">⚡</span>
        </div>
        
        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300' 
                  : 'text-white/50 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.icon size={20} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};