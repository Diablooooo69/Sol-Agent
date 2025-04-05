import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Loader2, ArrowRightLeft, TrendingUp, Lock } from 'lucide-react';

const LendingPage: React.FC = () => {
  const { wallet } = useWallet();
  const [lendingAmount, setLendingAmount] = useState<string>('');
  const [borrowingAmount, setBorrowingAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'USDC' | 'BTC'>('SOL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Mock lending positions
  const [lendingPositions, setLendingPositions] = useState<Array<{
    id: string;
    tokenType: 'SOL' | 'USDC' | 'BTC';
    amount: number;
    apy: number;
    startDate: Date;
    earned: number;
    type: 'lending' | 'borrowing';
  }>>([
    {
      id: 'lend-1',
      tokenType: 'SOL',
      amount: 10.5,
      apy: 4.8,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      earned: 0.027,
      type: 'lending'
    },
    {
      id: 'borrow-1',
      tokenType: 'USDC',
      amount: 500,
      apy: 8.2,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      earned: 5.62,
      type: 'borrowing'
    }
  ]);
  
  // Token information
  const tokens = {
    SOL: {
      name: 'Solana',
      lendingAPY: 4.8,
      borrowingAPY: 7.9,
      icon: '₳',
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    USDC: {
      name: 'USD Coin',
      lendingAPY: 5.2,
      borrowingAPY: 8.2,
      icon: '$',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    BTC: {
      name: 'Bitcoin',
      lendingAPY: 3.6,
      borrowingAPY: 6.5,
      icon: '₿',
      color: 'bg-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  };
  
  // Handle lending submission
  const handleLend = () => {
    if (!lendingAmount || parseFloat(lendingAmount) <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate lending process
    setTimeout(() => {
      const newLending = {
        id: `lend-${Date.now()}`,
        tokenType: selectedToken,
        amount: parseFloat(lendingAmount),
        apy: tokens[selectedToken].lendingAPY,
        startDate: new Date(),
        earned: 0,
        type: 'lending' as const
      };
      
      setLendingPositions([...lendingPositions, newLending]);
      setLendingAmount('');
      setIsProcessing(false);
    }, 2000);
  };
  
  // Handle borrowing submission
  const handleBorrow = () => {
    if (!borrowingAmount || parseFloat(borrowingAmount) <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate borrowing process
    setTimeout(() => {
      const newBorrowing = {
        id: `borrow-${Date.now()}`,
        tokenType: selectedToken,
        amount: parseFloat(borrowingAmount),
        apy: tokens[selectedToken].borrowingAPY,
        startDate: new Date(),
        earned: 0,
        type: 'borrowing' as const
      };
      
      setLendingPositions([...lendingPositions, newBorrowing]);
      setBorrowingAmount('');
      setIsProcessing(false);
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
      <Header title="Solana DeFi Lending" wallet={wallet} />
      
      {/* Hero Section */}
      <div className="brutalist-card p-8 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-4 border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-mono font-bold mb-4">DeFi Lending Platform</h1>
            <p className="text-lg mb-6">
              Access liquidity without selling your assets or earn interest by lending your crypto. Our secure platform offers competitive rates and flexible terms for both lenders and borrowers.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Lending APY</p>
                <p className="text-2xl font-bold">Up to 5.2%</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Borrowing APR</p>
                <p className="text-2xl font-bold">From 6.5%</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <p className="text-sm">Supported Assets</p>
                <p className="text-2xl font-bold">SOL, USDC, BTC</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/10144/10144752.png" 
              alt="Lending Illustration" 
              className="w-72 h-72 mx-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
      
      {/* Token Selector */}
      <div className="flex flex-wrap gap-4 mb-8">
        {(['SOL', 'USDC', 'BTC'] as const).map((token) => (
          <button
            key={token}
            className={`px-6 py-3 font-bold rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              selectedToken === token 
                ? `${tokens[token].color} text-white` 
                : 'bg-white text-gray-800'
            }`}
            onClick={() => setSelectedToken(token)}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{tokens[token].icon}</span>
              {tokens[token].name}
            </span>
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Lending Section */}
        <div>
          <BrutalistCard className="p-6 h-full border-4 border-black">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-600 w-5 h-5" />
              </div>
              <h2 className="text-2xl font-mono font-bold">Lend {selectedToken}</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Amount to Lend</label>
                <span className={`${tokens[selectedToken].textColor} text-sm font-bold`}>
                  APY: {formatPercentage(tokens[selectedToken].lendingAPY, 1)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={lendingAmount}
                  onChange={(e) => setLendingAmount(e.target.value)}
                  placeholder="0.0"
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    className="bg-indigo-600 text-white px-2 py-1 text-xs"
                    onClick={() => setLendingAmount(wallet ? '1.0' : '0.0')}
                  >
                    MAX
                  </button>
                  <span className="font-bold">{selectedToken}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">Lending Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lending APY</span>
                  <span className="font-bold text-green-600">{formatPercentage(tokens[selectedToken].lendingAPY, 1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Daily Earnings</span>
                  <span className="font-bold">
                    {formatCurrency((parseFloat(lendingAmount) || 0) * (tokens[selectedToken].lendingAPY / 100 / 365), 6)}
                    {' '}{selectedToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Lock Period</span>
                  <span className="font-bold">None</span>
                </div>
              </div>
            </div>
            
            <BrutalistButton
              className="w-full py-4 text-lg"
              color={selectedToken === 'SOL' ? 'purple' : selectedToken === 'USDC' ? 'blue' : 'yellow'}
              onClick={handleLend}
              disabled={!wallet || isProcessing || !lendingAmount || parseFloat(lendingAmount) <= 0}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                <span>Lend {selectedToken}</span>
              )}
            </BrutalistButton>
            
            {!wallet && (
              <p className="text-center text-sm text-red-500 mt-2">
                Connect your wallet to lend {selectedToken}
              </p>
            )}
          </BrutalistCard>
        </div>
        
        {/* Borrowing Section */}
        <div>
          <BrutalistCard className="p-6 h-full border-4 border-black">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="text-amber-600 w-5 h-5" />
              </div>
              <h2 className="text-2xl font-mono font-bold">Borrow {selectedToken}</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Amount to Borrow</label>
                <span className={`text-amber-600 text-sm font-bold`}>
                  APR: {formatPercentage(tokens[selectedToken].borrowingAPY, 1)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={borrowingAmount}
                  onChange={(e) => setBorrowingAmount(e.target.value)}
                  placeholder="0.0"
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="font-bold">{selectedToken}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">Borrowing Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Borrowing APR</span>
                  <span className="font-bold text-amber-600">{formatPercentage(tokens[selectedToken].borrowingAPY, 1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collateral Required</span>
                  <span className="font-bold">
                    {formatCurrency((parseFloat(borrowingAmount) || 0) * 1.5, 2)}
                    {' '}USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidation Threshold</span>
                  <span className="font-bold text-red-600">80%</span>
                </div>
              </div>
            </div>
            
            <BrutalistButton
              className="w-full py-4 text-lg"
              color={selectedToken === 'SOL' ? 'purple' : selectedToken === 'USDC' ? 'blue' : 'yellow'}
              onClick={handleBorrow}
              disabled={!wallet || isProcessing || !borrowingAmount || parseFloat(borrowingAmount) <= 0}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                <span>Borrow {selectedToken}</span>
              )}
            </BrutalistButton>
            
            {!wallet && (
              <p className="text-center text-sm text-red-500 mt-2">
                Connect your wallet to borrow {selectedToken}
              </p>
            )}
          </BrutalistCard>
        </div>
      </div>
      
      {/* Active Positions */}
      <div className="mb-8">
        <h2 className="text-2xl font-mono font-bold mb-6">Your Active Positions</h2>
        {lendingPositions.length === 0 ? (
          <div className="text-center py-10 bg-gray-100 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Active Positions</h3>
            <p className="text-gray-500 mb-6">Start lending or borrowing to create a position</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lendingPositions.map((position) => (
              <div 
                key={position.id}
                className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${tokens[position.tokenType].bgColor} rounded-full flex items-center justify-center`}>
                      <span className={`text-lg font-bold ${tokens[position.tokenType].textColor}`}>{tokens[position.tokenType].icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold">{position.amount} {position.tokenType}</h3>
                      <p className={`text-sm ${position.type === 'lending' ? 'text-green-600' : 'text-amber-600'}`}>
                        {position.type === 'lending' ? 'Lending' : 'Borrowing'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Since {formatDate(position.startDate)}</p>
                    <p className="text-sm font-bold">
                      {position.type === 'lending' ? 'APY' : 'APR'}: {formatPercentage(position.apy, 1)}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-md ${position.type === 'lending' ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">
                      {position.type === 'lending' ? 'Earned Interest' : 'Interest Owed'}:
                    </p>
                    <p className={`font-bold ${position.type === 'lending' ? 'text-green-600' : 'text-amber-600'}`}>
                      {position.earned.toFixed(4)} {position.tokenType}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {position.type === 'lending' ? (
                    <>
                      <BrutalistButton 
                        className="flex-1 py-2"
                        color="default"
                      >
                        Add More
                      </BrutalistButton>
                      <BrutalistButton 
                        className="flex-1 py-2"
                        color="red"
                      >
                        Withdraw
                      </BrutalistButton>
                    </>
                  ) : (
                    <>
                      <BrutalistButton 
                        className="flex-1 py-2"
                        color="default"
                      >
                        Collateral
                      </BrutalistButton>
                      <BrutalistButton 
                        className="flex-1 py-2"
                        color="green"
                      >
                        Repay
                      </BrutalistButton>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-mono font-bold mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-secure-payment-line text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Instant Liquidity</h3>
            <p className="text-gray-600">
              Access funds quickly without selling your crypto assets, with no credit checks or lengthy approval processes.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-funds-line text-2xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Competitive Rates</h3>
            <p className="text-gray-600">
              Earn higher returns on your idle assets with our competitive lending APYs, or borrow at reasonable interest rates.
            </p>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-lock-line text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Contract Security</h3>
            <p className="text-gray-600">
              Our platform is built on audited smart contracts with advanced security measures to protect your assets at all times.
            </p>
          </BrutalistCard>
        </div>
      </div>
    </div>
  );
};

export default LendingPage;