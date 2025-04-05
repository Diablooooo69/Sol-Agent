import React, { useState } from 'react';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import WithdrawalModal from './WithdrawalModal';
import { formatCurrency } from '@/lib/utils';

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
  const [startingCapital, setStartingCapital] = useState<number>(1000);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  
  const handleStartingCapitalChange = (value: number) => {
    setStartingCapital(value);
    onStartingCapitalChange(value);
  };
  
  const handleWithdraw = () => {
    if (onWithdraw) {
      onWithdraw();
    }
    setIsWithdrawalModalOpen(false);
  };
  
  return (
    <>
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
        
        {/* Starting Capital */}
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
              onChange={(e) => handleStartingCapitalChange(parseInt(e.target.value))}
              className="w-full h-3 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer"
              disabled={isActive}
            />
          </div>
        </div>
        
        {/* Current Value and Profit/Loss */}
        <div className="mb-6 p-3 bg-[#2A2A2A] rounded-md border-2 border-black">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-400">Current Value</p>
            <p className="text-sm font-bold">${currentValue.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-400">Profit/Loss</p>
            <p className={`text-sm font-bold ${profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
              {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
            </p>
          </div>
        </div>
        
        {/* Bot Controls */}
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
          
          {/* Withdrawal Option */}
          {profitLoss > 0 && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-md border-2 border-green-400 shadow-sm">
              <div className="mb-3">
                <p className="text-sm font-bold text-green-800 mb-2 uppercase">Available Profits</p>
                <div className="flex justify-between bg-white bg-opacity-70 p-2 rounded mb-1">
                  <p className="text-sm font-medium text-gray-700">Starting Capital</p>
                  <p className="text-sm font-bold text-blue-800">${startingCapital.toFixed(2)}</p>
                </div>
                <div className="flex justify-between bg-white bg-opacity-70 p-2 rounded mb-1">
                  <p className="text-sm font-medium text-gray-700">Current Profit</p>
                  <p className="text-sm font-bold text-brutalism-green">+${profitLoss.toFixed(2)}</p>
                </div>
                <div className="border-t border-green-200 my-2"></div>
                <div className="flex justify-between bg-white bg-opacity-70 p-2 rounded">
                  <p className="text-sm font-medium text-gray-700">Withdrawal Fee</p>
                  <p className="text-sm font-bold text-indigo-600">0.5 SOL</p>
                </div>
              </div>
              
              <BrutalistButton
                className="w-full py-2 text-sm font-bold"
                color="green"
                onClick={() => setIsWithdrawalModalOpen(true)}
              >
                <i className="ri-money-dollar-circle-line mr-1"></i> Withdraw Profits
              </BrutalistButton>
            </div>
          )}
        </div>
      </BrutalistCard>
      
      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onWithdraw={handleWithdraw}
        profitAmount={profitLoss}
      />
    </>
  );
};

export default TradingBot;
