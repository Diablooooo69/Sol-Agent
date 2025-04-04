import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { generateTradingData, formatCurrency, formatPercentage } from '@/lib/utils';
import { subscribeTradingState, getTradingState } from '@/lib/tradingState';

interface TradingPerformanceProps {
  isActive: boolean;
  startingCapital: number;
}

// Simple interfaces for chart data
interface DataPoint {
  time: Date;
  value: number;
  change: number;
}

const TradingPerformance: React.FC<TradingPerformanceProps> = ({
  isActive,
  startingCapital
}) => {
  // State from trading bot
  const [currentValue, setCurrentValue] = useState(startingCapital);
  const [totalChange, setTotalChange] = useState(0);
  const [totalChangePercentage, setTotalChangePercentage] = useState(0);
  const [tradeStats, setTradeStats] = useState({
    total: 0,
    profit: 0,
    loss: 0,
    avgWin: 0,
    avgLoss: 0,
    bestTrade: 0,
    worstTrade: 0,
    winRate: 0
  });
  
  // Get current trading state
  const getTradingStateData = () => {
    return getTradingState();
  };
  
  // Chart data
  const [data, setData] = useState<DataPoint[]>([]);
  
  // Subscribe to trading state updates
  useEffect(() => {
    // Subscribe to the trading state
    const unsubscribe = subscribeTradingState((state) => {
      setCurrentValue(state.currentValue);
      setTotalChange(state.profitLoss);
      setTotalChangePercentage(state.profitLossPercentage);
      
      // Only update other stats if there are trades
      if (state.tradeCount > 0) {
        setTradeStats({
          total: state.tradeCount,
          profit: state.winCount,
          loss: state.lossCount,
          avgWin: state.avgWinAmount,
          avgLoss: state.avgLossAmount,
          bestTrade: state.bestTrade,
          worstTrade: state.worstTrade,
          winRate: state.winRate
        });
        
        // Add new data point to the chart when a new trade happens
        addDataPoint(state.currentValue);
      }
    });
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
  
  // Initialize the chart data when the component mounts
  useEffect(() => {
    initializeChartData();
  }, []);
  
  // Initialize chart with some data points
  const initializeChartData = () => {
    const initialData: DataPoint[] = [];
    const now = new Date();
    
    // Generate 20 initial data points with slight uptrend bias
    for (let i = 0; i < 20; i++) {
      const minutesAgo = 19 - i;
      const pointTime = new Date(now.getTime() - minutesAgo * 60000);
      const baseValue = startingCapital * (1 + 0.01 * i); // Slight uptrend
      const randomOffset = (Math.random() - 0.45) * (startingCapital * 0.015); // Small random movements
      const value = baseValue + randomOffset;
      
      initialData.push({
        time: pointTime,
        value,
        change: i === 0 ? 0 : ((value - initialData[i-1].value) / initialData[i-1].value) * 100
      });
    }
    
    setData(initialData);
  };
  
  // Add a new data point to the chart
  const addDataPoint = (newValue: number) => {
    setData(prevData => {
      if (prevData.length === 0) {
        return [{
          time: new Date(),
          value: newValue,
          change: 0
        }];
      }
      
      const lastPoint = prevData[prevData.length - 1];
      const change = ((newValue - lastPoint.value) / lastPoint.value) * 100;
      
      const newPoint = {
        time: new Date(),
        value: newValue,
        change
      };
      
      // Keep only the last 20 points
      const newData = [...prevData, newPoint];
      if (newData.length > 20) {
        return newData.slice(newData.length - 20);
      }
      
      return newData;
    });
  };
  
  // Convert data points to SVG path
  const chartPath = () => {
    if (data.length === 0) return '';
    
    const min = Math.min(...data.map(d => d.value)) * 0.9;
    const max = Math.max(...data.map(d => d.value)) * 1.1;
    const range = max - min;
    
    return data.map((point, i) => {
      const x = (i / (data.length - 1)) * 800;
      const y = 200 - ((point.value - min) / range) * 200;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };
  
  // Determine if chart is showing an upward trend
  const isUpTrend = data.length > 0 && 
    data[data.length - 1].value > data[0].value;
  
  return (
    <BrutalistCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-mono font-bold text-lg">Live Performance</h3>
        <div>
          <p className={`${totalChangePercentage >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'} font-bold`}>
            {formatPercentage(totalChangePercentage)} Today
          </p>
        </div>
      </div>
      
      <div className="h-48 w-full mb-6">
        <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
          {/* Grid Lines */}
          <line x1="0" y1="0" x2="0" y2="200" stroke="#333" strokeWidth="1"/>
          <line x1="0" y1="0" x2="800" y2="0" stroke="#333" strokeWidth="1"/>
          <line x1="0" y1="50" x2="800" y2="50" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="100" x2="800" y2="100" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="150" x2="800" y2="150" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="200" x2="800" y2="200" stroke="#333" strokeWidth="1"/>
          
          {/* Live Chart Line */}
          <path 
            d={chartPath()} 
            className={`chart-line ${isUpTrend ? 'chart-line-up' : 'chart-line-down'}`}
          />
        </svg>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Current Value</p>
          <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
          <p className={`text-sm ${totalChange >= 0 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
            {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
          </p>
        </BrutalistCard>
        
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Trades Today</p>
          <p className="text-xl font-bold">{tradeStats.total}</p>
          <p className="text-sm text-brutalism-green">
            {tradeStats.profit} Profit / {tradeStats.loss} Loss
          </p>
        </BrutalistCard>
        
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="text-xl font-bold">{formatPercentage(tradeStats.winRate)}</p>
          <p className={`text-sm ${tradeStats.winRate > 50 ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
            {tradeStats.winRate > 50 ? 'Above average' : 'Below average'}
          </p>
        </BrutalistCard>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Avg. Win</p>
          <p className="text-xl font-bold text-brutalism-green">+{formatPercentage(tradeStats.avgWin)}</p>
          <p className="text-sm text-gray-500">Per winning trade</p>
        </BrutalistCard>
        
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Best Trade</p>
          <p className="text-xl font-bold text-brutalism-green">+{formatPercentage(Math.max(0, tradeStats.bestTrade))}</p>
          <p className="text-sm text-brutalism-green">Maximum profit</p>
        </BrutalistCard>
        
        <BrutalistCard className="p-3 bg-[#2A2A2A]">
          <p className="text-sm text-gray-400">Avg. Loss</p>
          <p className="text-xl font-bold text-brutalism-red">-{formatPercentage(tradeStats.avgLoss)}</p>
          <p className="text-sm text-gray-500">Per losing trade</p>
        </BrutalistCard>
      </div>
      
      <div className="mt-4">
        <h4 className="font-mono font-bold mb-2">Recent Trades</h4>
        <div className="bg-[#2A2A2A] p-3 rounded-md border-2 border-black">
          {(() => {
            const state = getTradingStateData();
            const recentTrades = state.trades.slice(-3).reverse();
            
            if (recentTrades.length === 0) {
              return (
                <div className="text-center py-3">
                  <p className="text-gray-400 text-sm">No trades executed yet</p>
                </div>
              );
            }
            
            return recentTrades.map((trade, index) => (
              <div 
                key={trade.id}
                className={`flex justify-between items-center ${
                  index < recentTrades.length - 1 ? 'mb-2 border-b border-gray-700 pb-2' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${trade.isWin ? 'bg-brutalism-green' : 'bg-brutalism-red'} mr-2`}></div>
                  <p className="text-sm">{trade.tokenSymbol}</p>
                </div>
                <p className={`text-sm ${trade.isWin ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                  {trade.profitLossPercentage > 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</p>
              </div>
            ));
          })()}
        </div>
      </div>
    </BrutalistCard>
  );
};

export default TradingPerformance;