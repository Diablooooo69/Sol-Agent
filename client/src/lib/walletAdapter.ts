import { useState, useEffect, useCallback } from 'react';

// Define wallet types
export type WalletProvider = 'phantom' | 'metamask' | 'solflare' | 'trustwallet';

export interface WalletInfo {
  name: string;
  icon: string;
  providerType: WalletProvider;
  color: string;
}

export interface ConnectedWallet {
  provider: WalletProvider;
  address: string;
  balance?: string;
}

// List of supported wallets
export const supportedWallets: WalletInfo[] = [
  {
    name: 'Phantom',
    icon: 'ri-ghost-line',
    providerType: 'phantom',
    color: '#9945FF'
  },
  {
    name: 'MetaMask',
    icon: 'ri-shape-line',
    providerType: 'metamask',
    color: '#F6851B'
  },
  {
    name: 'Solflare',
    icon: 'ri-sun-line',
    providerType: 'solflare',
    color: '#00FFBD'
  },
  {
    name: 'Trust Wallet',
    icon: 'ri-safe-2-line',
    providerType: 'trustwallet',
    color: '#3375BB'
  }
];

// Helper to check if a wallet provider is available
const isWalletAvailable = (provider: WalletProvider): boolean => {
  switch (provider) {
    case 'phantom':
      return window.solana !== undefined || !!window.phantom?.solana;
    case 'metamask':
      return window.ethereum !== undefined;
    case 'solflare':
      return window.solflare !== undefined;
    case 'trustwallet':
      return window.trustwallet !== undefined || window.ethereum?.isTrust === true;
    default:
      return false;
  }
};

// Hook for wallet connection
export function useWallet() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for previously connected wallet in local storage
  useEffect(() => {
    const savedWallet = localStorage.getItem('solana_ai_agent_wallet');
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        setWallet(parsed);
      } catch (err) {
        localStorage.removeItem('solana_ai_agent_wallet');
      }
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async (providerType: WalletProvider) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // In a real implementation, we would integrate with the actual wallet providers
      // For this demo, we'll simulate wallet connection
      
      if (!isWalletAvailable(providerType)) {
        throw new Error(`${providerType} wallet is not installed or available`);
      }
      
      // Simulate wallet connection
      // In a real implementation, this would be:
      // const accounts = await window[providerType].connect();
      // const address = accounts[0];
      
      // Mock implementation for demo purposes
      const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
      
      const connectedWallet: ConnectedWallet = {
        provider: providerType,
        address: mockAddress,
        balance: '10.00' // Mock balance
      };
      
      setWallet(connectedWallet);
      localStorage.setItem('solana_ai_agent_wallet', JSON.stringify(connectedWallet));
      
      // API call to register or update user
      const user = {
        walletAddress: mockAddress,
        username: `User_${mockAddress.substring(2, 6)}`
      };
      
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet(null);
    localStorage.removeItem('solana_ai_agent_wallet');
    
    // In a real implementation, we would also disconnect from the wallet
    // e.g., window[wallet.provider].disconnect();
  }, []);

  return {
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    isWalletAvailable
  };
}
