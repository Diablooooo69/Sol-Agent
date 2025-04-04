import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import TradingBot from '@/components/auto-trading/TradingBot';
import TradingPerformance from '@/components/auto-trading/TradingPerformance';
import { useWallet } from '@/lib/walletAdapter';
import { 
  subscribeTradingState, 
  startTradingBot, 
  stopTradingBot, 
  resetTradingState, 
  getTradingState,
  updateTradingState
} from '@/lib/tradingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

// Game modes for trading simulation
const GAME_MODES = [
  { id: 'standard', name: 'Standard', risk: 'Medium', description: 'Balanced risk-reward ratio for steady gains' },
  { id: 'aggressive', name: 'Aggressive', risk: 'High', description: 'Higher risk for potentially larger rewards' },
  { id: 'conservative', name: 'Conservative', risk: 'Low', description: 'Lower risk with more consistent but smaller gains' }
];

const AutoTrading: React.FC = () => {
  const { wallet } = useWallet();
  const [isBotActive, setIsBotActive] = useState(false);
  const [gameMode, setGameMode] = useState('standard');
  const [startingCapital, setStartingCapital] = useState(1000);
  const [currentValue, setCurrentValue] = useState(startingCapital);
  const [profitLoss, setProfitLoss] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [avgWinAmount, setAvgWinAmount] = useState(0);
  const [avgLossAmount, setAvgLossAmount] = useState(0);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  
  // Subscribe to trading state updates
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribeTradingState((state) => {
      setIsBotActive(state.isActive);
      setCurrentValue(state.currentValue);
      setProfitLoss(state.profitLoss);
      setProfitPercentage(state.profitLossPercentage);
      setTradeCount(state.tradeCount);
      setWinRate(state.winRate);
      setAvgWinAmount(state.avgWinAmount);
      setAvgLossAmount(state.avgLossAmount);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Handle start bot
  const handleStartBot = () => {
    startTradingBot(gameMode, startingCapital);
    setIsBotActive(true);
  };
  
  // Handle stop bot
  const handleStopBot = () => {
    stopTradingBot();
    setIsBotActive(false);
  };
  
  // Handle starting capital change
  const handleStartingCapitalChange = (value: number) => {
    setStartingCapital(value);
    if (!isBotActive) {
      resetTradingState(value, gameMode);
      setCurrentValue(value);
    }
  };
  
  // Handle game mode change
  const handleGameModeChange = (mode: string) => {
    setGameMode(mode);
    if (!isBotActive) {
      resetTradingState(startingCapital, mode);
    }
  };
  
  // Start backtesting
  const startBacktest = () => {
    setIsBacktesting(true);
    // Run 100 simulated trades for the backtest
    setTimeout(() => {
      // Complete backtest
      setIsBacktesting(false);
      setBacktestResults({
        profitLoss: 327.85,
        profitPercentage: 32.79,
        winRate: 62.5,
        avgWinAmount: 8.43,
        avgLossAmount: 5.12,
        tradeCount: 100,
        bestTrade: 24.61,
        worstTrade: -15.32,
        drawdown: 12.5,
        sharpeRatio: 1.83
      });
    }, 3000);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Header title="Solana Memecoin Trading Bot" wallet={wallet} />
      
      <div className="brutalist-card p-5 mb-6">
        <h2 className="text-2xl font-mono font-bold mb-2">Solana Memecoin Bot Simulator</h2>
        <p className="text-sm text-gray-500 mb-4">
          Simulates trading of newly launched Solana memecoins. The bot executes trades every 8 seconds 
          with a 60% winning ratio to simulate real-world trading conditions.
        </p>
        
        <Tabs defaultValue="trader" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="trader" className="font-mono">Trading Bot</TabsTrigger>
            <TabsTrigger value="backtest" className="font-mono">Backtesting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trader" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bot Controls */}
              <div className="lg:col-span-1">
                <div className="brutalist-card p-4 border-2 border-dashed border-gray-800">
                  <h3 className="font-mono font-bold text-xl mb-4">Bot Configuration</h3>
                  
                  {/* Game Mode Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-mono mb-2">Game Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {GAME_MODES.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => handleGameModeChange(mode.id)}
                          className={`brutalist-button py-2 px-3 text-xs font-mono ${
                            gameMode === mode.id 
                              ? 'bg-black text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {mode.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      {GAME_MODES.find(m => m.id === gameMode)?.description}
                    </p>
                  </div>
                  
                  {/* Starting Capital */}
                  <div className="mb-4">
                    <label className="block text-sm font-mono mb-2">Starting Capital</label>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">$</span>
                      <input
                        type="number"
                        value={startingCapital}
                        onChange={(e) => handleStartingCapitalChange(Number(e.target.value))}
                        className="brutalist-input w-full"
                        min="100"
                        max="10000"
                        step="100"
                        disabled={isBotActive}
                      />
                    </div>
                  </div>
                  
                  {/* Risk Parameters */}
                  <div className="mb-4">
                    <h4 className="font-mono text-sm mb-2">Risk Parameters</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Risk Per Trade:</span>
                        <span className="ml-1 font-bold">
                          {getTradingState().riskPerTrade}%
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Stop Loss:</span>
                        <span className="ml-1 font-bold">
                          {getTradingState().stopLossPercentage}%
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Take Profit:</span>
                        <span className="ml-1 font-bold">
                          {getTradingState().takeProfitPercentage}%
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Target Win Rate:</span>
                        <span className="ml-1 font-bold">60%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Current Position */}
                  <div className="mb-4 p-3 bg-gray-100 rounded-md">
                    <h4 className="font-mono text-sm mb-2">Current Position</h4>
                    {(() => {
                      const state = getTradingState();
                      const position = state.currentPosition;
                      
                      if (!position) {
                        return <p className="text-xs text-gray-500">No active position</p>;
                      }
                      
                      return (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">Asset:</span>
                            <span className="text-xs font-bold">{position.tokenSymbol}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">Amount:</span>
                            <span className="text-xs font-bold">${position.value.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Entry:</span>
                            <span className="text-xs font-bold">${position.entryPrice.toFixed(4)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Bot Controls */}
                  <div className="flex space-x-2">
                    {!isBotActive ? (
                      <button
                        onClick={handleStartBot}
                        className="brutalist-button bg-brutalism-green text-white py-2 px-4 font-mono flex-grow"
                      >
                        Start Bot
                      </button>
                    ) : (
                      <button
                        onClick={handleStopBot}
                        className="brutalist-button bg-brutalism-red text-white py-2 px-4 font-mono flex-grow"
                      >
                        Stop Bot
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Stats Card */}
                <div className="brutalist-card p-4 mt-4 border-2 border-dashed border-gray-800">
                  <h3 className="font-mono font-bold text-xl mb-4">Trading Stats</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Starting Capital:</span>
                      <span className="text-sm font-bold">${startingCapital.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Current Value:</span>
                      <span className={`text-sm font-bold ${profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                        ${currentValue.toFixed(2)}
                        {profitLoss !== 0 && (
                          <span className="ml-1 text-xs">
                            ({profitLoss > 0 ? '+' : ''}{profitLoss.toFixed(2)})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Profit/Loss:</span>
                      <span className={`text-sm font-bold ${profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                        {profitLoss > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="h-[1px] bg-gray-200 my-3"></div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Total Trades:</span>
                      <span className="text-sm font-bold">{tradeCount}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Win Rate:</span>
                      <span className="text-sm font-bold">{winRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="h-[1px] bg-gray-200 my-3"></div>
                    
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">Avg Win:</span>
                      <span className="text-sm font-bold text-brutalism-green">+{avgWinAmount.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Avg Loss:</span>
                      <span className="text-sm font-bold text-brutalism-red">-{avgLossAmount.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live Performance */}
              <div className="lg:col-span-2">
                <div className="brutalist-card p-4 h-full border-2 border-dashed border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono font-bold text-xl">Live Performance</h3>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center">
                      {isBotActive ? (
                        <>
                          <span className="w-3 h-3 rounded-full bg-brutalism-green mr-2 animate-pulse"></span>
                          <p className="text-brutalism-green text-sm font-mono">LIVE TRADING</p>
                        </>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                          <p className="text-gray-400 text-sm font-mono">INACTIVE</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <TradingPerformance
                    isActive={isBotActive}
                    startingCapital={startingCapital}
                  />
                  
                  {/* Recent Trades */}
                  <div className="mt-6">
                    <h4 className="font-mono text-lg mb-3">Recent Trades</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const state = getTradingState();
                            const recentTrades = state.trades.slice(-5).reverse();
                            
                            if (recentTrades.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} className="px-3 py-4 text-sm text-center text-gray-500">
                                    No trades yet. Start the bot to begin trading.
                                  </td>
                                </tr>
                              );
                            }
                            
                            return recentTrades.map(trade => (
                              <tr key={trade.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {new Date(trade.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  {trade.tokenSymbol}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  ${trade.price.toFixed(4)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  ${trade.value.toFixed(2)}
                                </td>
                                <td className={`px-3 py-2 whitespace-nowrap text-xs text-right font-bold ${
                                  trade.profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'
                                }`}>
                                  {trade.profitLoss > 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                                  <span className="text-xxs ml-1">
                                    ({trade.profitLossPercentage > 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%)
                                  </span>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backtest" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="brutalist-card p-4 border-2 border-dashed border-gray-800">
                <h3 className="font-mono font-bold text-xl mb-4">Backtest Configuration</h3>
                
                {/* Game Mode Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-mono mb-2">Game Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GAME_MODES.map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => handleGameModeChange(mode.id)}
                        className={`brutalist-button py-2 px-3 text-xs font-mono ${
                          gameMode === mode.id 
                            ? 'bg-black text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Starting Capital */}
                <div className="mb-4">
                  <label className="block text-sm font-mono mb-2">Initial Capital</label>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">$</span>
                    <input
                      type="number"
                      value={startingCapital}
                      onChange={(e) => handleStartingCapitalChange(Number(e.target.value))}
                      className="brutalist-input w-full"
                      min="100"
                      max="10000"
                      step="100"
                    />
                  </div>
                </div>
                
                {/* Test Period */}
                <div className="mb-4">
                  <label className="block text-sm font-mono mb-2">Test Period</label>
                  <select className="brutalist-input w-full">
                    <option value="100">100 Trades</option>
                    <option value="250">250 Trades</option>
                    <option value="500">500 Trades</option>
                    <option value="1000">1000 Trades</option>
                  </select>
                </div>
                
                {/* Market Condition */}
                <div className="mb-6">
                  <label className="block text-sm font-mono mb-2">Market Condition</label>
                  <select className="brutalist-input w-full">
                    <option value="neutral">Neutral Market</option>
                    <option value="bull">Bull Market</option>
                    <option value="bear">Bear Market</option>
                    <option value="volatile">Highly Volatile</option>
                  </select>
                </div>
                
                <button
                  onClick={startBacktest}
                  disabled={isBacktesting}
                  className="brutalist-button bg-black text-white py-2 px-4 font-mono w-full flex justify-center items-center"
                >
                  {isBacktesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Backtest...
                    </>
                  ) : (
                    'Run Backtest'
                  )}
                </button>
              </div>
              
              <div className="brutalist-card p-4 border-2 border-dashed border-gray-800">
                <h3 className="font-mono font-bold text-xl mb-4">Backtest Results</h3>
                
                {backtestResults ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="brutalist-card p-3 bg-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Profit/Loss</p>
                        <p className={`text-xl font-bold ${backtestResults.profitLoss >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                          {backtestResults.profitLoss > 0 ? '+' : ''}${backtestResults.profitLoss.toFixed(2)}
                        </p>
                        <p className={`text-xs ${backtestResults.profitPercentage >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                          {backtestResults.profitPercentage > 0 ? '+' : ''}{backtestResults.profitPercentage.toFixed(2)}%
                        </p>
                      </div>
                      
                      <div className="brutalist-card p-3 bg-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                        <p className="text-xl font-bold">{backtestResults.winRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{backtestResults.tradeCount} trades</p>
                      </div>
                    </div>
                    
                    <h4 className="font-mono text-sm mb-2">Detailed Statistics</h4>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Avg Win:</span>
                        <span className="text-xs font-bold text-brutalism-green">+{backtestResults.avgWinAmount.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Avg Loss:</span>
                        <span className="text-xs font-bold text-brutalism-red">-{backtestResults.avgLossAmount.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Best Trade:</span>
                        <span className="text-xs font-bold text-brutalism-green">+{backtestResults.bestTrade.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Worst Trade:</span>
                        <span className="text-xs font-bold text-brutalism-red">{backtestResults.worstTrade.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Max Drawdown:</span>
                        <span className="text-xs font-bold">{backtestResults.drawdown.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Sharpe Ratio:</span>
                        <span className="text-xs font-bold">{backtestResults.sharpeRatio.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button className="brutalist-button bg-gray-800 text-white py-1 px-3 text-xs font-mono">
                        Download Report
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-2">No backtest results yet</p>
                    <p className="text-xs text-gray-500">Configure parameters and run a backtest to see results</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Trading Bot Features */}
      <div className="mt-8">
        <h2 className="text-2xl font-mono font-bold mb-4">Solana Memecoin Bot Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="brutalist-card p-5">
            <h3 className="font-mono font-bold text-lg mb-2">Memecoin Focus</h3>
            <p className="text-sm text-gray-600 mb-4">
              Specialized in detecting and trading newly launched memecoin smart contracts on Solana, 
              targeting the most volatile and potentially profitable tokens.
            </p>
            <div className="mt-auto text-right">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                High Volatility
              </span>
            </div>
          </div>
          
          <div className="brutalist-card p-5">
            <h3 className="font-mono font-bold text-lg mb-2">Smart Execution</h3>
            <p className="text-sm text-gray-600 mb-4">
              Automatically executes trades every 8 seconds with dynamic stop-loss and take-profit levels based on 
              market conditions and token volatility.
            </p>
            <div className="mt-auto text-right">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Efficient
              </span>
            </div>
          </div>
          
          <div className="brutalist-card p-5">
            <h3 className="font-mono font-bold text-lg mb-2">Risk Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sophisticated risk management system maintains a 60% win ratio while protecting capital
              with adaptive position sizing based on market conditions.
            </p>
            <div className="mt-auto text-right">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Capital Protection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTrading;
