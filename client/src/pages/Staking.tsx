import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const StakingPage: React.FC = () => {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<number>(30); // days
  const [isStaking, setIsStaking] = useState<boolean>(false);
  
  // Mock staked positions
  const [stakedPositions, setStakedPositions] = useState<Array<{
    id: string;
    amount: number;
    startDate: Date;
    endDate: Date;
    apr: number;
    rewards: number;
    status: 'active' | 'pending' | 'completed';
  }>>([
    {
      id: 'stake-1',
      amount: 5.5,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      apr: 12.5,
      rewards: 0.094,
      status: 'active'
    }
  ]);
  
  // APR calculation based on lock period
  const getAPR = (days: number): number => {
    if (days <= 30) return 12.5;
    if (days <= 90) return 15.8;
    if (days <= 180) return 18.2;
    return 22.6; // > 180 days
  };
  
  // Calculate estimated rewards
  const calculateRewards = (amountStr: string, days: number): number => {
    const amountNum = parseFloat(amountStr) || 0;
    const apr = getAPR(days);
    return (amountNum * apr / 100) * (days / 365);
  };
  
  // Handle staking submission
  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsStaking(true);
    
    // Simulate staking process
    setTimeout(() => {
      const newStake = {
        id: `stake-${Date.now()}`,
        amount: parseFloat(amount),
        startDate: new Date(),
        endDate: new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000),
        apr: getAPR(lockPeriod),
        rewards: calculateRewards(amount, lockPeriod),
        status: 'active' as const
      };
      
      setStakedPositions([...stakedPositions, newStake]);
      setAmount('');
      setIsStaking(false);
    }, 2000);
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Header title="Solana Staking" wallet={wallet} />
      
      {/* Hero Section */}
      <div className="brutalist-card p-8 mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-4 border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-mono font-bold mb-4">Solana Staking</h1>
            <p className="text-lg mb-6">
              Unlock the full potential of your Solana with our advanced staking platform! Enjoy an unbeatable high APR while benefiting from flexible lock periods and robust, user-friendly features designed to maximize your rewards.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Flexible Lock Periods</p>
                <p className="text-2xl font-bold">30-365 Days</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Highest APR</p>
                <p className="text-2xl font-bold">Up to 22.6%</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Minimum Stake</p>
                <p className="text-2xl font-bold">0.1 SOL</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/7858/7858975.png" 
              alt="Staking Illustration" 
              className="w-72 h-72 mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staking Form */}
        <div className="lg:col-span-1">
          <BrutalistCard className="p-6 h-full border-4 border-black">
            <h2 className="text-2xl font-mono font-bold mb-6">Stake SOL</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Amount (SOL)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button 
                  className="absolute right-1 top-1 bg-indigo-600 text-white px-2 py-1 text-xs"
                  onClick={() => setAmount(wallet ? '1.0' : '0.0')}
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: 0.1 SOL</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Lock Period</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>30 Days</span>
                    <span>365 Days</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="365"
                    step="1"
                    value={lockPeriod}
                    onChange={(e) => setLockPeriod(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{lockPeriod} Days</span>
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded">
                    {formatPercentage(getAPR(lockPeriod), 1)} APR
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">Estimated Rewards</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Per Day</p>
                  <p className="font-bold">{formatCurrency(calculateRewards(amount, lockPeriod) / lockPeriod, 6)} SOL</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold">{formatCurrency(calculateRewards(amount, lockPeriod), 4)} SOL</p>
                </div>
              </div>
            </div>
            
            <BrutalistButton
              className="w-full py-4 text-lg"
              color="purple"
              onClick={handleStake}
              disabled={!wallet || isStaking || !amount || parseFloat(amount) < 0.1}
            >
              {isStaking ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                <span>Stake Now</span>
              )}
            </BrutalistButton>
            
            {!wallet && (
              <p className="text-center text-sm text-red-500 mt-2">
                Connect your wallet to stake SOL
              </p>
            )}
          </BrutalistCard>
        </div>
        
        {/* Staking Positions */}
        <div className="lg:col-span-2">
          <BrutalistCard className="p-6 h-full border-4 border-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-mono font-bold">Your Staking Positions</h2>
              <p className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                {stakedPositions.length} Active Positions
              </p>
            </div>
            
            {stakedPositions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-stack-line text-2xl text-gray-500"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
                <p className="text-gray-500 mb-6">Start staking SOL to earn rewards</p>
                <BrutalistButton
                  className="px-6 py-2"
                  color="blue"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Stake Now
                </BrutalistButton>
              </div>
            ) : (
              <div className="space-y-4">
                {stakedPositions.map((position) => (
                  <div 
                    key={position.id}
                    className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md"
                  >
                    <div className="flex flex-wrap justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-lg">{position.amount} SOL</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          position.status === 'active' ? 'bg-green-100 text-green-800' :
                          position.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {position.id}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium">{formatDate(position.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-sm font-medium">{formatDate(position.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">APR</p>
                        <p className="text-sm font-medium text-green-600">{formatPercentage(position.apr, 1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Earned Rewards</p>
                        <p className="text-sm font-medium text-indigo-600">+{position.rewards.toFixed(4)} SOL</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, Math.max(0, 
                            ((Date.now() - position.startDate.getTime()) / 
                            (position.endDate.getTime() - position.startDate.getTime())) * 100
                          ))}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Progress</span>
                      <span>{Math.min(100, Math.max(0, 
                        Math.round((Date.now() - position.startDate.getTime()) / 
                        (position.endDate.getTime() - position.startDate.getTime()) * 100)
                      ))}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BrutalistCard>
        </div>
      </div>
      
      {/* Staking Benefits */}
      <div className="mt-12">
        <h2 className="text-2xl font-mono font-bold mb-6">Staking Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-line-chart-line text-2xl text-indigo-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">High APR Returns</h3>
            <p className="text-gray-600">
              Earn up to 22.6% APR on your staked SOL, significantly higher than traditional staking platforms.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-timer-line text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Flexible Lock Periods</h3>
            <p className="text-gray-600">
              Choose your commitment level with lock periods ranging from 30 to 365 days, with higher APR for longer locks.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-shield-check-line text-2xl text-yellow-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">
              All staking operations are secured by advanced protocols with full transparency on the Solana blockchain.
            </p>
          </BrutalistCard>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-mono font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">What is Solana staking?</h3>
            <p className="text-gray-600">
              Staking SOL means locking your tokens to support the Solana network's security and operations. In return, you receive staking rewards generated from transaction fees and inflation.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">Can I unstake before the lock period ends?</h3>
            <p className="text-gray-600">
              Yes, but early unstaking comes with a penalty that reduces your earned rewards proportional to the remaining lock time. For emergency cases, you can unstake with a higher fee.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-lg font-bold mb-2">How are rewards calculated and distributed?</h3>
            <p className="text-gray-600">
              Rewards are calculated based on your staked amount, lock period APR, and staking duration. Rewards accumulate daily and are distributed to your wallet at the end of the lock period.
            </p>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;