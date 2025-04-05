import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistToggle } from '../ui/brutalist-toggle';
import { BrutalistInput } from '../ui/brutalist-input';

interface TradingBotProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onStartingCapitalChange: (value: number) => void;
  onWithdraw?: () => void;
  currentValue?: number;
  profitLoss?: number;
}

const TradingBot: React.FC<TradingBotProps> = ({
  isActive,
  onStart,
  onStop,
  onStartingCapitalChange,
  onWithdraw,
  currentValue = 0,
  profitLoss = 0
}) => {
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [startingCapital, setStartingCapital] = useState<number>(1000);
  const [autoRebalance, setAutoRebalance] = useState<boolean>(true);
  const [tradingPairs, setTradingPairs] = useState<string[]>(['BTC/USDT', 'SOL/USDT', 'ETH/USDT']);
  const [newPair, setNewPair] = useState<string>('');
  
  return (
    <BrutalistCard>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-mono font-bold text-lg">Trading Bot</h3>
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-brutalism-green animate-pulse' : 'bg-brutalism-red'} mr-2`}></span>
          <p className={isActive ? 'text-brutalism-green text-sm' : 'text-brutalism-red text-sm'}>
            {isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Risk Level</p>
          <p className="text-sm font-bold capitalize">{riskLevel}</p>
        </div>
        <div className="flex space-x-2">
          <BrutalistButton
            className="py-1 flex-1 text-sm"
            color={riskLevel === 'low' ? 'blue' : 'default'}
            onClick={() => setRiskLevel('low')}
          >
            Low
          </BrutalistButton>
          <BrutalistButton
            className="py-1 flex-1 text-sm"
            color={riskLevel === 'medium' ? 'blue' : 'default'}
            onClick={() => setRiskLevel('medium')}
          >
            Medium
          </BrutalistButton>
          <BrutalistButton
            className="py-1 flex-1 text-sm"
            color={riskLevel === 'high' ? 'blue' : 'default'}
            onClick={() => setRiskLevel('high')}
          >
            High
          </BrutalistButton>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Starting Capital</p>
          <p className="text-sm font-bold">${startingCapital.toFixed(2)}</p>
        </div>
        <div className="relative">
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={startingCapital}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setStartingCapital(value);
              onStartingCapitalChange(value);
            }}
            className="w-full h-3 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400">Auto Rebalance</p>
          <BrutalistToggle
            checked={autoRebalance}
            onChange={() => setAutoRebalance(!autoRebalance)}
          />
        </div>
      </div>
      
      {/* Always show current value and profit/loss, whether active or not */}
      <div className="mb-6 p-3 bg-[#2A2A2A] rounded-md border-2 border-black">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Current Value</p>
          <p className="text-sm font-bold">${currentValue.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-400">Profit/Loss</p>
          <p className={`text-sm font-bold ${profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
            {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USD
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Trading Pairs</p>
          <p className="text-sm font-bold">{tradingPairs.length}</p>
        </div>
        <div className="bg-[#2A2A2A] p-2 rounded-md border-2 border-black mb-2 max-h-24 overflow-y-auto">
          {tradingPairs.map((pair, index) => (
            <div key={index} className="flex justify-between items-center mb-1 last:mb-0">
              <span className="text-sm">{pair}</span>
              <BrutalistButton
                className="py-0 px-2 text-xs"
                color="red"
                onClick={() => setTradingPairs(tradingPairs.filter((_, i) => i !== index))}
              >
                X
              </BrutalistButton>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <BrutalistInput 
            className="flex-1"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            placeholder="BTC/USDT"
          />
          <BrutalistButton
            color="green"
            onClick={() => {
              if (newPair && !tradingPairs.includes(newPair)) {
                setTradingPairs([...tradingPairs, newPair]);
                setNewPair('');
              }
            }}
          >
            Add
          </BrutalistButton>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        {isActive ? (
          <BrutalistButton
            className="w-full py-3"
            color="red"
            onClick={onStop}
          >
            <i className="ri-stop-line mr-2"></i> Stop Trading Bot
          </BrutalistButton>
        ) : (
          <BrutalistButton
            className="w-full py-3"
            color="green"
            onClick={onStart}
          >
            <i className="ri-play-line mr-2"></i> Start Trading Bot
          </BrutalistButton>
        )}
        
        {profitLoss > 0 && (
          <div className="p-3 bg-[#2A2A2A] rounded-md border-2 border-black">
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-1">Withdraw Profits</p>
              <div className="flex justify-between">
                <p className="text-sm">Starting Capital</p>
                <p className="text-sm font-bold">${startingCapital.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Current Profit</p>
                <p className="text-sm font-bold text-brutalism-green">+${profitLoss.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Withdrawal Fee</p>
                <p className="text-sm font-bold">0.5 SOL</p>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <p className="text-sm">Net Withdrawal</p>
                <p className="text-sm font-bold text-brutalism-green">${profitLoss.toFixed(2)}</p>
              </div>
            </div>
            
            <BrutalistButton
              className="w-full py-2 text-sm"
              color="yellow"
              onClick={() => {
                const txId = window.prompt(
                  "Please send 0.5 SOL to 6B2RkaJevbKkAVmBZ4W2eNvQWApHwtd6TQggSuTmyVJ5 and paste transaction ID here to withdraw your profits:"
                );
                if (txId) {
                  // In a real app, you would verify the transaction here
                  alert(`Withdrawal of $${profitLoss.toFixed(2)} profit is processing. You will receive funds after transaction verification.`);
                  if (onWithdraw) {
                    onWithdraw();
                  }
                }
              }}
            >
              <i className="ri-money-dollar-circle-line mr-1"></i> Withdraw Profits
            </BrutalistButton>
          </div>
        )}
      </div>
    </BrutalistCard>
  );
};

export default TradingBot;
