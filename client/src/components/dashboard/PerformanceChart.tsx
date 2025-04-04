import React, { useState, useEffect } from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { getRandomTradingData } from '@/lib/utils';

interface PerformanceChartProps {
  title: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ title }) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [chartData, setChartData] = useState<number[]>([]);
  
  useEffect(() => {
    // Generate random trading data based on timeframe
    const periods = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
    const volatility = timeframe === 'day' ? 0.01 : timeframe === 'week' ? 0.03 : 0.05;
    const trend = 0.002;
    
    setChartData(getRandomTradingData(periods, volatility, trend));
  }, [timeframe]);
  
  // Calculate if the chart is trending up or down
  const isUp = chartData.length > 1 && chartData[chartData.length - 1] > chartData[0];
  
  // Convert chart data to SVG path
  const generateSvgPath = (data: number[]): string => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data) * 0.95;
    const max = Math.max(...data) * 1.05;
    const range = max - min;
    
    const width = 800;
    const height = 300;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    // Create a smooth curve through the points
    return `M${points[0]} ${points.slice(1).map(point => `L${point}`).join(' ')}`;
  };
  
  const linePath = generateSvgPath(chartData);
  const areaPath = `${linePath} L${800},${300} L${0},${300} Z`;
  
  return (
    <BrutalistCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-mono font-bold text-xl">{title}</h2>
        <div className="flex space-x-2">
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color={timeframe === 'day' ? 'blue' : 'default'}
            onClick={() => setTimeframe('day')}
          >
            Day
          </BrutalistButton>
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color={timeframe === 'week' ? 'blue' : 'default'}
            onClick={() => setTimeframe('week')}
          >
            Week
          </BrutalistButton>
          <BrutalistButton
            className="py-1 px-3 text-sm"
            color={timeframe === 'month' ? 'blue' : 'default'}
            onClick={() => setTimeframe('month')}
          >
            Month
          </BrutalistButton>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
          {/* Grid Lines */}
          <line x1="0" y1="0" x2="0" y2="300" stroke="#333" strokeWidth="1"/>
          <line x1="0" y1="0" x2="800" y2="0" stroke="#333" strokeWidth="1"/>
          <line x1="0" y1="75" x2="800" y2="75" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="150" x2="800" y2="150" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="225" x2="800" y2="225" stroke="#333" strokeWidth="1" strokeDasharray="5,5"/>
          <line x1="0" y1="300" x2="800" y2="300" stroke="#333" strokeWidth="1"/>
          
          {/* Main Chart Line */}
          <path d={linePath} className={`chart-line ${isUp ? 'chart-line-up' : 'chart-line-down'}`}/>
          
          {/* Area under the line */}
          <path d={areaPath} className={`chart-area ${isUp ? 'chart-area-up' : 'chart-area-down'}`}/>
        </svg>
      </div>
    </BrutalistCard>
  );
};

export default PerformanceChart;
