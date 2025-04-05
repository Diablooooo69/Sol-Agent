import React from 'react';
import { Link, useLocation } from 'wouter';
import WalletDisplay from '@/components/wallet/WalletDisplay';
import { ConnectedWallet } from '@/lib/walletAdapter';

interface SidebarProps {
  wallet: ConnectedWallet | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  isMobile,
  onCloseMobileMenu
}) => {
  const [location] = useLocation();

  const isActive = (path: string): boolean => {
    return location === path;
  };

  const navItems = [
    { path: '/', name: 'Dashboard', icon: 'ri-dashboard-line', color: 'bg-brutalism-red' },
    { path: '/auto-trading', name: 'Auto Trading', icon: 'ri-robot-line', color: 'bg-brutalism-blue' },
    { path: '/ai-agent-builder', name: 'AI Agent Builder', icon: 'ri-flow-chart', color: 'bg-brutalism-purple' },
    { path: '/token-creator', name: 'Token Creator', icon: 'ri-coin-line', color: 'bg-brutalism-yellow' },
    { path: '/staking', name: 'Staking', icon: 'ri-stack-line', color: 'bg-brutalism-green' },
    { path: '/lending', name: 'Lending', icon: 'ri-funds-line', color: 'bg-indigo-500' },
    { path: '/llm', name: 'LLM', icon: 'ri-ai-generate', color: 'bg-brutalism-green' },
    { path: '/mcp', name: 'MCP', icon: 'ri-cpu-line', color: 'bg-brutalism-purple' },
  ];

  return (
    <aside className={`w-64 bg-[#1A1A1A] border-r-4 border-black flex flex-col h-screen fixed sidebar z-20 ${isMobile ? 'transform -translate-x-full transition-transform' : ''}`}>
      <div className="p-6 border-b-4 border-black">
        <h1 className="text-xl font-bold">Solana AI Agent</h1>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={isMobile ? onCloseMobileMenu : undefined}
                className={`sidebar-item flex items-center p-3 text-white hover:text-white ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center mr-3 ${item.color} rounded-lg`}>
                  <i className={`${item.icon} text-white`}></i>
                </div>
                <span className="font-mono font-bold">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t-4 border-black">
        <WalletDisplay
          wallet={wallet}
          onConnect={onConnectWallet}
          onDisconnect={onDisconnectWallet}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
