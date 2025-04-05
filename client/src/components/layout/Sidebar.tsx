import React from "react";
import { Link, useLocation } from "wouter";
import WalletDisplay from "@/components/wallet/WalletDisplay";
import { ConnectedWallet } from "@/lib/walletAdapter";

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
  onCloseMobileMenu,
}) => {
  const [location] = useLocation();

  const isActive = (path: string): boolean => {
    return location === path;
  };

  const navItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: "ri-dashboard-line",
      color: "bg-brutalism-red",
    },
    {
      path: "/auto-trading",
      name: "Auto Trading",
      icon: "ri-robot-line",
      color: "bg-brutalism-blue",
    },
    {
      path: "/ai-agent-builder",
      name: "AI Agent Builder",
      icon: "ri-flow-chart",
      color: "bg-brutalism-purple",
      badge: "BETA",
    },
    {
      path: "/token-creator",
      name: "Token Creator",
      icon: "ri-coin-line",
      color: "bg-brutalism-yellow",
    },
    {
      path: "/staking",
      name: "Staking",
      icon: "ri-stack-line",
      color: "bg-brutalism-green",
    },
    {
      path: "/lending",
      name: "Lending",
      icon: "ri-funds-line",
      color: "bg-indigo-500",
    },
    {
      path: "/llm",
      name: "LLM Library",
      icon: "ri-ai-generate",
      color: "bg-brutalism-purple",
    },
    {
      path: "/mcp",
      name: "MCP",
      icon: "ri-cpu-line",
      color: "bg-brutalism-purple",
    },
  ];

  return (
    <aside
      className={`w-64 bg-[#1A1A1A] border-r-4 border-black flex flex-col h-screen fixed sidebar z-20 ${isMobile ? "transform -translate-x-full transition-transform" : ""}`}
    >
      <div className="p-6 border-b-4 border-black">
        <h1 className="text-xl font-bold"> Autryntix </h1>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={isMobile ? onCloseMobileMenu : undefined}
                className={`sidebar-item flex items-center p-3 text-white hover:text-white ${isActive(item.path) ? "active" : ""}`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center mr-3 ${item.color} rounded-lg`}
                >
                  <i className={`${item.icon} text-white`}></i>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-md font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
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
