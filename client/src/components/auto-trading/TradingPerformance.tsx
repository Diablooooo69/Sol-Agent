import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { generateTradingData, formatCurrency, formatPercentage } from '@/lib/utils';

interface Trade {
  symbol: string;
  percentage: number;
  time: string;
  isPositive: boolean;
}

interface TradingPerformanceProps {
  isActive: boolean;
  startingCapital: number;
}

const TradingPerformance: React.FC<TradingPerformanceProps> = ({
  isActive,
  startingCapital
}) => {
  const [currentValue, setCurrentValue] = useState(startingCapital);
  const [totalChange, setTotalChange] = useState(0);
  const [totalChangePercentage, setTotalChangePercentage] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [tradeStats, setTradeStats] = useState({
    total: 0,
    profit: 0,
    loss: 0,
    avgTrade: 0
  });
  
  useEffect(() => {
    if (!isActive) return;
    
    // Initialize with some random trades
    const initialTrades: Trade[] = [
      {
        symbol: 'BTC/USDT',
        percentage: 4.2,
        time: '10 min ago',
        isPositive: true
      },
      {
        symbol: 'SOL/USDT',
        percentage: -1.8,
        time: '25 min ago',
        isPositive: false
      },
      {
        symbol: 'ETH/USDT',
        percentage: 2.5,
        time: '43 min ago',
        isPositive: true
      }
    ];
    
    setRecentTrades(initialTrades);
    
    // Generate initial stats
    setTradeStats({
      total: 7,
      profit: 5,
      loss: 2,
      avgTrade: 2.4
    });
    
    // Generate initial performance metrics
    const changeValue = startingCapital * 0.123;
    setCurrentValue(startingCapital + changeValue);
    setTotalChange(changeValue);
    setTotalChangePercentage(12.3);
    
    // Update performance data at regular intervals when active
    const interval = setInterval(() => {
      if (!isActive) return;
      
      // Update current value
      const changePercent = (Math.random() - 0.4) * 0.5; // Slightly biased towards positive
      const newChangeValue = currentValue * changePercent;
      const newValue = currentValue + newChangeValue;
      
      setCurrentValue(newValue);
      setTotalChange(newValue - startingCapital);
      setTotalChangePercentage(((newValue - startingCapital) / startingCapital) * 100);
      
      // Occasionally add a new trade
      if (Math.random() > 0.7) {
        const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'SHIB/USDT'];
        const tradePercent = (Math.random() * 2 - 0.5) * 5; // -2.5% to +7.5%, biased positive
        
        const newTrade: Trade = {
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          percentage: parseFloat(tradePercent.toFixed(2)),
          time: 'just now',
          isPositive: tradePercent > 0
        };
        
        // Update trade times
        const updatedTrades = recentTrades.map(trade => {
          if (trade.time === 'just now') return { ...trade, time: '1 min ago' };
          if (trade.time === '1 min ago') return { ...trade, time: '5 min ago' };
          if (trade.time === '5 min ago') return { ...trade, time: '10 min ago' };
          return trade;
        });
        
        // Add new trade to beginning of list and limit to 3
        setRecentTrades([newTrade, ...updatedTrades.slice(0, 2)]);
        
        // Update trade stats
        setTradeStats(prev => ({
          total: prev.total + 1,
          profit: prev.profit + (newTrade.isPositive ? 1 : 0),
          loss: prev.loss + (newTrade.isPositive ? 0 : 1),
          avgTrade: parseFloat((((prev.avgTrade * prev.total) + tradePercent) / (prev.total + 1)).toFixed(1))
        }));
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isActive, currentValue, recentTrades, startingCapital]);
  
  // Generate chart data for performance visualization
  const [data, setData] = useState<{time: Date; value: number; change: number}[]>([]);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Generate initial data
    setData(generateTradingData(startingCapital, 20));
    
    // Update data at regular intervals
    const interval = setInterval(() => {
      if (!isActive) return;
      
      setData(prev => {
        const lastPoint = prev[prev.length - 1];
        const change = (Math.random() - 0.45) * 2; // Slightly biased towards positive
        const newValue = lastPoint.value + change;
        
        const newPoint = {
          time: new Date(),
          value: newValue,
          change: (change / lastPoint.value) * 100
        };
        
        return [...prev.slice(1), newPoint];
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isActive, startingCapital]);
  
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
      
      <div className="grid grid-cols-3 gap-3 text-center">
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
          <p className="text-sm text-gray-400">Avg. Trade</p>
          <p className="text-xl font-bold">{formatPercentage(tradeStats.avgTrade)}</p>
          <p className="text-sm text-brutalism-green">Better than avg.</p>
        </BrutalistCard>
      </div>
      
      <div className="mt-4">
        <h4 className="font-mono font-bold mb-2">Recent Trades</h4>
        <div className="bg-[#2A2A2A] p-3 rounded-md border-2 border-black">
          {recentTrades.map((trade, index) => (
            <div 
              key={index}
              className={`flex justify-between items-center ${
                index < recentTrades.length - 1 ? 'mb-2 border-b border-gray-700 pb-2' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${trade.isPositive ? 'bg-brutalism-green' : 'bg-brutalism-red'} mr-2`}></div>
                <p className="text-sm">{trade.symbol}</p>
              </div>
              <p className={`text-sm ${trade.isPositive ? 'text-brutalism-green' : 'text-brutalism-red'}`}>
                {trade.isPositive ? '+' : ''}{trade.percentage}%
              </p>
              <p className="text-xs text-gray-400">{trade.time}</p>
            </div>
          ))}
        </div>
      </div>
    </BrutalistCard>
  );
};

export default TradingPerformance;
