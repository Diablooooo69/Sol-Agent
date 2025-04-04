import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistToggle } from '../ui/brutalist-toggle';

interface TradingBotProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
}

const TradingBot: React.FC<TradingBotProps> = ({
  isActive,
  onStart,
  onStop
}) => {
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [startingCapital, setStartingCapital] = useState<number>(1000);
  const [autoRebalance, setAutoRebalance] = useState<boolean>(true);
  
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
            onChange={(e) => setStartingCapital(parseInt(e.target.value))}
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
      
      <div className="mt-6">
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
      </div>
    </BrutalistCard>
  );
};

export default TradingBot;
