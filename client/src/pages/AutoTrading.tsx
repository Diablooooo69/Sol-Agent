import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import TradingBot from '@/components/auto-trading/TradingBot';
import TradingPerformance from '@/components/auto-trading/TradingPerformance';
import { useWallet } from '@/lib/walletAdapter';
import { updateTradingState, getTradingState } from '@/lib/tradingState';

const AutoTrading: React.FC = () => {
  const { wallet } = useWallet();
  const [isBotActive, setIsBotActive] = useState(false);
  const [startingCapital, setStartingCapital] = useState(1000);
  const [currentValue, setCurrentValue] = useState(startingCapital);
  const [profitLoss, setProfitLoss] = useState(0);
  
  // Update profit/loss values when TradingPerformance component changes values
  useEffect(() => {
    if (!isBotActive) {
      // We don't reset values here anymore
      // Just mark as inactive but preserve values
      updateTradingState({ 
        isActive: false
      });
      return;
    }
    
    // Attach a global listener for trade updates
    const handleTradeEvent = (event: CustomEvent) => {
      const { currentValue } = event.detail;
      const newProfitLoss = currentValue - startingCapital;
      const profitPercentage = (newProfitLoss / startingCapital) * 100;
      
      setCurrentValue(currentValue);
      setProfitLoss(newProfitLoss);
      
      // Update global trading state
      updateTradingState({
        isActive: true,
        currentValue,
        profitLoss: newProfitLoss,
        profitPercentage
      });
    };
    
    // Create a custom event for trade updates
    window.addEventListener('tradeUpdate' as any, handleTradeEvent as any);
    
    return () => {
      window.removeEventListener('tradeUpdate' as any, handleTradeEvent as any);
    };
  }, [isBotActive, startingCapital]);
  
  const handleStartBot = () => {
    setIsBotActive(true);
    updateTradingState({ isActive: true });
  };
  
  const handleStopBot = () => {
    setIsBotActive(false);
    
    // When stopping the bot, make sure to update the global state
    // This will show the profit/loss in the dashboard
    const state = getTradingState();
    updateTradingState({ 
      isActive: false,
      currentValue: state.currentValue,
      profitLoss: state.currentValue - state.startingCapital,
      profitPercentage: ((state.currentValue - state.startingCapital) / state.startingCapital) * 100
    });
  };
  
  const handleStartingCapitalChange = (value: number) => {
    setStartingCapital(value);
    if (!isBotActive) {
      setCurrentValue(value);
      // Update global state
      updateTradingState({ startingCapital: value, currentValue: value });
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Header title="Auto Trading Simulator" wallet={wallet} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bot Controls */}
        <div className="lg:col-span-1">
          <TradingBot
            isActive={isBotActive}
            onStart={handleStartBot}
            onStop={handleStopBot}
            onStartingCapitalChange={handleStartingCapitalChange}
            currentValue={currentValue}
            profitLoss={profitLoss}
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
