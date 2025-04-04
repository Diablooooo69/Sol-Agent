import React from 'react';
import { BrutalistInput } from '../ui/brutalist-input';
import { formatWalletAddress } from '@/lib/utils';
import { ConnectedWallet } from '@/lib/walletAdapter';

interface HeaderProps {
  title: string;
  wallet: ConnectedWallet | null;
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  wallet,
  onMobileMenuToggle,
  isMobile
}) => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('en-US', options);

  return (
    <header className="mb-8 flex justify-between items-center header-flex">
      {isMobile && (
        <button
          onClick={onMobileMenuToggle}
          className="mr-4 md:hidden"
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
      )}
      
      <div>
        <h1 className="text-3xl font-mono font-bold">{title}</h1>
        <p className="text-gray-400">{formattedDate}</p>
      </div>
      
      <div className="flex space-x-4 items-center">
        <div className="relative search-container">
          <BrutalistInput
            type="text"
            placeholder="Search..."
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center">
            <i className="ri-search-line text-gray-400"></i>
          </div>
        </div>
        
        {wallet && isMobile && (
          <div className="hidden md:flex items-center">
            <div className="py-1 px-3 bg-brutalism-blue bg-opacity-20 rounded-full">
              <span className="text-sm font-mono">{formatWalletAddress(wallet.address)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
