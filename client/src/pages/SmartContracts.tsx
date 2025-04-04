import React from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';

const SmartContracts: React.FC = () => {
  const { wallet } = useWallet();
  
  return (
    <div className="max-w-7xl mx-auto">
      <Header title="Smart Contracts" wallet={wallet} />
      
      <h2 className="text-2xl font-mono font-bold mb-6">Manage Smart Contracts</h2>
      
      <div className="text-center py-12">
        <h3 className="text-xl font-mono font-bold mb-4">Coming Soon</h3>
        <p className="text-gray-400">The Smart Contracts feature is coming soon. Check back later!</p>
      </div>
    </div>
  );
};

export default SmartContracts;
