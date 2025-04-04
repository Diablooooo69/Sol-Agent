import React from 'react';
import { BrutalistCard } from '../ui/brutalist-card';
import { BrutalistButton } from '../ui/brutalist-button';
import { WalletInfo, WalletProvider } from '@/lib/walletAdapter';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletInfo[];
  onConnect: (provider: WalletProvider) => void;
  isConnecting: boolean;
  error: string | null;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onConnect,
  isConnecting,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <BrutalistCard className="w-full max-w-md p-6 bg-[#1E1E1E]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-mono font-bold">Connect Wallet</h2>
          <BrutalistButton
            onClick={onClose}
            className="!rounded-button w-8 h-8 flex items-center justify-center p-0"
            color="red"
          >
            <i className="ri-close-line"></i>
          </BrutalistButton>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-brutalism-red bg-opacity-10 border-l-4 border-brutalism-red">
            <p className="text-sm text-brutalism-red">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 wallet-grid">
          {wallets.map((wallet) => (
            <button
              key={wallet.providerType}
              className="brutalist-button !rounded-button p-4 bg-[#2A2A2A] text-white font-mono text-left wallet-option"
              onClick={() => onConnect(wallet.providerType)}
              disabled={isConnecting}
            >
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center border-2 border-black"
                  style={{ backgroundColor: wallet.color }}
                >
                  <i className={`${wallet.icon} text-white text-xl`}></i>
                </div>
                <span className="font-bold">{wallet.name}</span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            By connecting your wallet, you agree to our{' '}
            <a href="#" className="text-brutalism-blue underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-brutalism-blue underline">Privacy Policy</a>.
          </p>
        </div>
      </BrutalistCard>
    </div>
  );
};

export default WalletConnectModal;
