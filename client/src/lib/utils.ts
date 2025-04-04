import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWalletAddress(address: string | null | undefined): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: number, options: { decimals?: number; prefix?: string; suffix?: string } = {}): string {
  const { decimals = 2, prefix = '', suffix = '' } = options;
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

export function formatCurrency(value: number, decimals = 2): string {
  return formatNumber(value, { decimals, prefix: '$' });
}

export function formatPercentage(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value, { decimals, suffix: '%' })}`;
}

export function getRandomTradingData(periods = 20, volatility = 0.02, trend = 0.01): number[] {
  let lastValue = 100;
  const data: number[] = [lastValue];
  
  for (let i = 1; i < periods; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility + trend;
    lastValue = lastValue * (1 + change);
    data.push(lastValue);
  }
  
  return data;
}

export function generateRandomWallet(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateTradingData(baseValue: number, periods: number): {
  time: Date;
  value: number;
  change: number;
}[] {
  const result = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < periods; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - (periods - i));
    
    const change = (Math.random() - 0.45) * 2; // Slightly biased towards positive
    currentValue += change;
    
    result.push({
      time,
      value: currentValue,
      change: (change / currentValue) * 100
    });
  }
  
  return result;
}

export function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    'dataSource': 'bg-brutalism-blue',
    'aiProcessor': 'bg-brutalism-purple',
    'action': 'bg-brutalism-green',
    'conditional': 'bg-brutalism-red',
    'notification': 'bg-brutalism-yellow'
  };
  
  return colors[type] || 'bg-gray-500';
}
