import React from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';

const TokenCreator: React.FC = () => {
  const { wallet } = useWallet();
  
  return (
    <div className="max-w-7xl mx-auto">
      <Header title="Token Creator" wallet={wallet} />
      
      <h2 className="text-2xl font-mono font-bold mb-6">Create Your Solana Token</h2>
      
      <div className="text-center py-12">
        <h3 className="text-xl font-mono font-bold mb-4">Coming Soon</h3>
        <p className="text-gray-400">The Token Creator feature is coming soon. Check back later!</p>
      </div>
    </div>
  );
};

export default TokenCreator;
