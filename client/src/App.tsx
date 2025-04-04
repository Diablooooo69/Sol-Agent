import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/Sidebar";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";
import { useWallet, supportedWallets } from "@/lib/walletAdapter";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AutoTrading from "@/pages/AutoTrading";
import AIAgentBuilder from "@/pages/AIAgentBuilder";
import TokenCreator from "@/pages/TokenCreator";
import SmartContracts from "@/pages/SmartContracts";
import Pump from "@/pages/Pump";

function App() {
  const { wallet, connect, disconnect, isConnecting, error } = useWallet();
  const [location] = useLocation();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if viewport is mobile-sized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Handle wallet connection flow
  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };
  
  const handleWalletSelect = (provider: string) => {
    connect(provider as any);
    setIsWalletModalOpen(false);
  };
  
  const handleDisconnectWallet = () => {
    disconnect();
  };
  
  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen flex bg-[#121212]">
      {/* Sidebar */}
      <Sidebar
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isMobile={isMobile}
        onCloseMobileMenu={closeMobileMenu}
      />
      
      {/* Mobile menu button */}
      {isMobile && (
        <button
          className="fixed left-4 top-4 z-30 bg-brutalism-blue p-2 rounded-md"
          onClick={toggleMobileMenu}
        >
          <i className="ri-menu-line text-white text-xl"></i>
        </button>
      )}
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={supportedWallets}
        onConnect={handleWalletSelect}
        isConnecting={isConnecting}
        error={error}
      />
      
      {/* Main Content */}
      <main className={`flex-1 p-8 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/auto-trading" component={AutoTrading} />
          <Route path="/ai-agent-builder" component={AIAgentBuilder} />
          <Route path="/token-creator" component={TokenCreator} />
          <Route path="/smart-contracts" component={SmartContracts} />
          <Route path="/pump" component={Pump} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
