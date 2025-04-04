import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import TradingBot from '@/components/auto-trading/TradingBot';
import TradingPerformance from '@/components/auto-trading/TradingPerformance';
import { useWallet } from '@/lib/walletAdapter';

const AutoTrading: React.FC = () => {
  const { wallet } = useWallet();
  const [isBotActive, setIsBotActive] = useState(false);
  const [startingCapital, setStartingCapital] = useState(1000);
  
  const handleStartBot = () => {
    setIsBotActive(true);
  };
  
  const handleStopBot = () => {
    setIsBotActive(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <Header title="Auto Trading Simulator" wallet={wallet} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bot Controls */}
        <div className="lg:col-span-1">
          <TradingBot
            isActive={isBotActive}
            onStart={handleStartBot}
            onStop={handleStopBot}
          />
        </div>
        
        {/* Live Performance */}
        <div className="lg:col-span-2">
          <TradingPerformance
            isActive={isBotActive}
            startingCapital={startingCapital}
          />
        </div>
      </div>
      
      {/* Bot List */}
      <div className="mt-8">
        <h2 className="text-2xl font-mono font-bold mb-4">Your Trading Bots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="brutalist-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold">Crypto Momentum Bot</h3>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-brutalism-green mr-2"></span>
                <p className="text-brutalism-green text-sm">Active</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">Performance (7d)</p>
              <p className="text-brutalism-green font-bold">+8.3%</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">Risk Level</p>
              <p className="text-sm font-bold">Medium</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="brutalist-button py-1 px-3 text-sm bg-[#2A2A2A] text-white font-mono">Edit</button>
              <button className="brutalist-button py-1 px-3 text-sm bg-brutalism-red text-white font-mono">Stop</button>
            </div>
          </div>
          
          <div className="brutalist-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold">Solana DeFi Bot</h3>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-brutalism-green mr-2"></span>
                <p className="text-brutalism-green text-sm">Active</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">Performance (7d)</p>
              <p className="text-brutalism-green font-bold">+12.7%</p>
            </div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">Risk Level</p>
              <p className="text-sm font-bold">High</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="brutalist-button py-1 px-3 text-sm bg-[#2A2A2A] text-white font-mono">Edit</button>
              <button className="brutalist-button py-1 px-3 text-sm bg-brutalism-red text-white font-mono">Stop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTrading;
