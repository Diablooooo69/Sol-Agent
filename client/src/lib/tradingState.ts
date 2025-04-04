// Trading state management service for Solana Memecoin Trading Bot

export interface Trade {
  id: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  tokenSymbol: string;
  tokenName: string;
  contractAddress: string;
  price: number;
  amount: number;
  value: number;
  profitLoss: number;
  profitLossPercentage: number;
  isWin: boolean;
  txHash?: string;
}

// Global variables to store trading data
let tradingBotState = {
  isActive: false,
  gameMode: 'standard', // standard, aggressive, conservative
  startingCapital: 1000,
  currentValue: 1000,
  availableBalance: 1000, // Cash available (not in active positions)
  profitLoss: 0,
  profitLossPercentage: 0,
  tradeCount: 0,
  winCount: 0,
  lossCount: 0,
  winRate: 0,
  avgWinAmount: 0,
  avgLossAmount: 0,
  bestTrade: 0,
  worstTrade: 0,
  currentPosition: null as null | {
    tokenSymbol: string;
    tokenName: string;
    contractAddress: string;
    entryPrice: number;
    amount: number;
    value: number;
    timestamp: Date;
  },
  trades: [] as Trade[],
  stopLossPercentage: 15, // Default stop loss at 15%
  takeProfitPercentage: 25, // Default take profit at 25%
  riskPerTrade: 10, // Percentage of available balance to risk per trade
  lastTradedToken: null as null | {
    tokenSymbol: string;
    tokenName: string;
    contractAddress: string;
  },
  lastUpdated: new Date()
};

// Trading state listeners
type TradingStateListener = (state: typeof tradingBotState) => void;
const listeners: TradingStateListener[] = [];

// Simulation timer interval
let tradeTimer: ReturnType<typeof setInterval> | null = null;

// Subscribe to trading state changes
export function subscribeTradingState(listener: TradingStateListener) {
  listeners.push(listener);
  // Immediately call with current state
  listener(tradingBotState);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

// Update trading state
export function updateTradingState(updates: Partial<typeof tradingBotState>) {
  tradingBotState = {
    ...tradingBotState,
    ...updates,
    lastUpdated: new Date()
  };
  
  // Notify all listeners
  listeners.forEach(listener => listener(tradingBotState));
}

// Start the trading bot
export function startTradingBot(gameMode = 'standard', startingCapital = 1000) {
  // Don't start if already active
  if (tradingBotState.isActive) return;
  
  // Reset with the starting capital if current value is 0
  if (tradingBotState.currentValue <= 0) {
    resetTradingState(startingCapital, gameMode);
  } else {
    // Just update gameMode if continuing with existing capital
    updateTradingState({ gameMode, isActive: true });
  }
  
  // Execute first trade
  executeBuyTrade();
  
  // Set a fixed trade execution interval (8 seconds as specified)
  tradeTimer = setInterval(() => {
    const state = getTradingState();
    
    // Check if bot is active
    if (!state.isActive) {
      if (tradeTimer) {
        clearInterval(tradeTimer);
        tradeTimer = null;
      }
      return;
    }
    
    // If there's no current position, buy one
    if (state.currentPosition === null && state.availableBalance > 0) {
      executeBuyTrade();
    }
    
    // Monitor stop loss and take profit for current position
    if (state.currentPosition) {
      // This monitoring is handled by the executeSellTrade function which is triggered on its own timer
    }
    
  }, 8000); // 8 seconds between new trade checks
}

// Stop the trading bot
export function stopTradingBot() {
  // Clear timers
  if (tradeTimer) {
    clearInterval(tradeTimer);
    tradeTimer = null;
  }
  
  // Mark as inactive
  updateTradingState({ isActive: false });
  
  // If there's an open position, sell it
  if (tradingBotState.currentPosition) {
    executeSellTrade();
  }
}

// Get current trading state
export function getTradingState() {
  return { ...tradingBotState };
}

// Generate a random token for trading simulation
function generateRandomToken() {
  const prefixes = ['SOL', 'MOON', 'DOGE', 'PEPE', 'SHIB', 'CAT', 'FLOKI', 'APE', 'KONG', 'ELON'];
  const suffixes = ['INU', 'MOON', 'ROCKET', 'KING', 'WARRIOR', 'COIN', 'DOGE', 'EMPIRE'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.random() > 0.6 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  const tokenSymbol = `${prefix}${suffix}`;
  
  return {
    tokenSymbol,
    tokenName: `${prefix} ${suffix}`.trim(),
    contractAddress: `${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
}

// Start a new trade (buy)
export function executeBuyTrade() {
  const state = getTradingState();
  if (!state.isActive || state.currentPosition !== null) return;
  
  const token = generateRandomToken();
  const tradeAmount = (state.availableBalance * (state.riskPerTrade / 100));
  const entryPrice = 1.0;  // Base price
  const amount = tradeAmount / entryPrice;
  
  const position = {
    tokenSymbol: token.tokenSymbol,
    tokenName: token.tokenName,
    contractAddress: token.contractAddress,
    entryPrice,
    amount,
    value: tradeAmount,
    timestamp: new Date()
  };
  
  updateTradingState({
    currentPosition: position,
    availableBalance: state.availableBalance - tradeAmount,
    lastTradedToken: token
  });
  
  // Schedule a sell after a random period (market conditions)
  const holdTime = 3000 + Math.random() * 5000; // 3-8 seconds
  setTimeout(() => executeSellTrade(), holdTime);
}

// End a trade (sell)
export function executeSellTrade() {
  const state = getTradingState();
  if (!state.isActive || state.currentPosition === null) return;
  
  // Determine if this trade is a win (60% probability)
  const isWin = Math.random() < 0.6;
  
  // Calculate exit price with some volatility
  const volatility = (Math.random() * 20) + 5; // 5-25% price movement
  const priceChange = isWin ? volatility : -volatility;
  const exitPrice = state.currentPosition.entryPrice * (1 + priceChange / 100);
  
  // Calculate profit/loss
  const newValue = state.currentPosition.amount * exitPrice;
  const tradeProfitLoss = newValue - state.currentPosition.value;
  const tradeProfitLossPercentage = (tradeProfitLoss / state.currentPosition.value) * 100;
  
  // Update best/worst trades
  const bestTrade = Math.max(state.bestTrade, tradeProfitLossPercentage);
  const worstTrade = Math.min(state.worstTrade, tradeProfitLossPercentage);
  
  // Create trade record
  const tradeId = `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const trade: Trade = {
    id: tradeId,
    timestamp: new Date(),
    type: 'sell',
    tokenSymbol: state.currentPosition.tokenSymbol,
    tokenName: state.currentPosition.tokenName,
    contractAddress: state.currentPosition.contractAddress,
    price: exitPrice,
    amount: state.currentPosition.amount,
    value: newValue,
    profitLoss: tradeProfitLoss,
    profitLossPercentage: tradeProfitLossPercentage,
    isWin,
    txHash: `tx-${Math.random().toString(36).substring(2, 15)}`
  };
  
  // Update counters
  const winCount = isWin ? state.winCount + 1 : state.winCount;
  const lossCount = !isWin ? state.lossCount + 1 : state.lossCount;
  const tradeCount = state.tradeCount + 1;
  const winRate = (winCount / tradeCount) * 100;
  
  // Update overall profit/loss
  const newTotalValue = state.availableBalance + newValue;
  const overallProfitLoss = newTotalValue - state.startingCapital;
  const overallProfitLossPercentage = (overallProfitLoss / state.startingCapital) * 100;
  
  // Calculate average win/loss amounts
  let avgWinAmount = state.avgWinAmount;
  let avgLossAmount = state.avgLossAmount;
  
  if (isWin) {
    avgWinAmount = winCount === 1 
      ? tradeProfitLossPercentage 
      : (state.avgWinAmount * (winCount - 1) + tradeProfitLossPercentage) / winCount;
  } else {
    avgLossAmount = lossCount === 1 
      ? Math.abs(tradeProfitLossPercentage) 
      : (state.avgLossAmount * (lossCount - 1) + Math.abs(tradeProfitLossPercentage)) / lossCount;
  }
  
  // Update trading state
  updateTradingState({
    currentPosition: null,
    availableBalance: newTotalValue,
    currentValue: newTotalValue,
    profitLoss: overallProfitLoss,
    profitLossPercentage: overallProfitLossPercentage,
    tradeCount,
    winCount,
    lossCount,
    winRate,
    avgWinAmount,
    avgLossAmount,
    bestTrade,
    worstTrade,
    trades: [...state.trades, trade]
  });
  
  // Start a new trade if bot is still active
  if (state.isActive) {
    // Random delay between trades (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => executeBuyTrade(), delay);
  }
}

// Reset trading state
export function resetTradingState(startingCapital = 1000, gameMode = 'standard') {
  const resetState = {
    isActive: false,
    gameMode: gameMode,
    startingCapital,
    currentValue: startingCapital,
    availableBalance: startingCapital,
    profitLoss: 0,
    profitLossPercentage: 0,
    tradeCount: 0,
    winCount: 0,
    lossCount: 0,
    winRate: 0,
    avgWinAmount: 0,
    avgLossAmount: 0,
    bestTrade: 0,
    worstTrade: 0,
    currentPosition: null,
    trades: [],
    stopLossPercentage: gameMode === 'conservative' ? 10 : gameMode === 'aggressive' ? 20 : 15,
    takeProfitPercentage: gameMode === 'conservative' ? 15 : gameMode === 'aggressive' ? 35 : 25,
    riskPerTrade: gameMode === 'conservative' ? 5 : gameMode === 'aggressive' ? 15 : 10,
    lastTradedToken: null,
    lastUpdated: new Date()
  } as typeof tradingBotState;
  
  tradingBotState = resetState;
  
  // Notify all listeners
  listeners.forEach(listener => listener(tradingBotState));
}