import React from 'react';
import { BrutalistButton } from '../ui/brutalist-button';
import { BrutalistCard } from '../ui/brutalist-card';
import { ConnectedWallet } from '@/lib/walletAdapter';
import { formatWalletAddress } from '@/lib/utils';

interface WalletDisplayProps {
  wallet: ConnectedWallet | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  wallet,
  onConnect,
  onDisconnect
}) => {
  return (
    <BrutalistCard className="p-4 bg-[#2A2A2A]">
      {wallet ? (
        <div className="flex items-center justify-between" id="walletDisplay">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-brutalism-blue flex items-center justify-center border-2 border-black overflow-hidden">
              <i className="ri-wallet-3-line text-white ri-lg"></i>
            </div>
            <div className="ml-3">
              <p className="font-mono font-bold text-white text-xs">{formatWalletAddress(wallet.address)}</p>
              <p className="text-xs text-gray-400">Connected</p>
            </div>
          </div>
          <div>
            <BrutalistButton
              onClick={onDisconnect}
              className="!rounded-button px-3 py-1 text-xs"
              color="red"
            >
              <i className="ri-logout-box-line mr-1"></i>
            </BrutalistButton>
          </div>
        </div>
      ) : (
        <div id="connectWalletSection">
          <BrutalistButton
            onClick={onConnect}
            className="!rounded-button w-full py-2 mb-2"
            color="blue"
          >
            <i className="ri-wallet-3-line mr-2"></i> Connect Wallet
          </BrutalistButton>
          <p className="text-xs text-center text-gray-400">Connect to access all features</p>
        </div>
      )}
    </BrutalistCard>
  );
};

export default WalletDisplay;
