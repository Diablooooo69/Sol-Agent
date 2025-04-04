// Trading state management service

// Global variables to store trading data
let tradingBotState = {
  isActive: false,
  startingCapital: 1000,
  currentValue: 1000,
  profitLoss: 0,
  profitPercentage: 0,
  tradeCount: 0,
  winCount: 0,
  lossCount: 0,
  bestTrade: 0,
  worstTrade: 0,
  lastUpdated: new Date()
};

// Trading state listeners
type TradingStateListener = (state: typeof tradingBotState) => void;
const listeners: TradingStateListener[] = [];

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

// Get current trading state
export function getTradingState() {
  return { ...tradingBotState };
}

// Reset trading state
export function resetTradingState(startingCapital = 1000) {
  tradingBotState = {
    isActive: false,
    startingCapital,
    currentValue: startingCapital,
    profitLoss: 0,
    profitPercentage: 0,
    tradeCount: 0,
    winCount: 0,
    lossCount: 0,
    bestTrade: 0,
    worstTrade: 0,
    lastUpdated: new Date()
  };
  
  // Notify all listeners
  listeners.forEach(listener => listener(tradingBotState));
}