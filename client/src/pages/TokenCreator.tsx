import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { BrutalistButton } from '@/components/ui/brutalist-button';
import { BrutalistInput } from '@/components/ui/brutalist-input';
import { useWallet } from '@/lib/walletAdapter';
import { useToast } from '@/hooks/use-toast';
import { formatWalletAddress } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TokenFormData {
  // Basic Token Information
  tokenName: string;
  symbol: string;
  totalSupply: string;
  decimals: string;
  image: string | null;
  
  // Authority & Ownership
  mintAuthority: string;
  freezeAuthority: boolean;
  
  // Fee Structure & Transaction Features
  transactionFee: string;
  rewardsAllocation: string;
  burnAllocation: string;
  liquidityAllocation: string;
  
  // Advanced Features
  antiWhale: boolean;
  maxWalletPercentage: string;
  maxTransactionPercentage: string;
  autoLiquidity: boolean;
  rewardHolders: boolean;
  
  // Additional Metadata
  network: 'mainnet' | 'devnet' | 'testnet';
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
}

const defaultFormData: TokenFormData = {
  tokenName: '',
  symbol: '',
  totalSupply: '1000000',
  decimals: '9',
  image: null,
  
  mintAuthority: '',
  freezeAuthority: false,
  
  transactionFee: '2.5',
  rewardsAllocation: '50',
  burnAllocation: '30',
  liquidityAllocation: '20',
  
  antiWhale: false,
  maxWalletPercentage: '2',
  maxTransactionPercentage: '1',
  autoLiquidity: false,
  rewardHolders: false,
  
  network: 'devnet',
  description: '',
  website: '',
  twitter: '',
  telegram: '',
  discord: ''
};

const TokenCreator: React.FC = () => {
  const { wallet } = useWallet();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<TokenFormData>({
    ...defaultFormData,
    mintAuthority: wallet?.address || ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    tokenAddress?: string;
    explorerUrl?: string;
  } | null>(null);
  
  // Calculate the total of fee allocations
  const totalAllocation = 
    Number(formData.rewardsAllocation) + 
    Number(formData.burnAllocation) + 
    Number(formData.liquidityAllocation);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
    }
    
    // Handle numeric inputs
    if (type === 'number' || name === 'totalSupply' || name === 'decimals' || 
        name === 'transactionFee' || name === 'rewardsAllocation' || 
        name === 'burnAllocation' || name === 'liquidityAllocation' ||
        name === 'maxWalletPercentage' || name === 'maxTransactionPercentage') {
      
      // Remove non-numeric characters except for decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
      return;
    }
    
    // Handle other inputs
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type (only images)
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setFormData({
        ...formData,
        image: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Move to next step
  const goToNextStep = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.tokenName.trim()) {
        toast({
          title: "Token name required",
          description: "Please enter a name for your token",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.symbol.trim()) {
        toast({
          title: "Token symbol required",
          description: "Please enter a symbol for your token",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.totalSupply || Number(formData.totalSupply) <= 0) {
        toast({
          title: "Invalid total supply",
          description: "Total supply must be greater than 0",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.mintAuthority.trim()) {
        toast({
          title: "Mint authority required",
          description: "Please enter a wallet address for mint authority",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 3) {
      if (totalAllocation !== 100) {
        toast({
          title: "Invalid fee allocation",
          description: "Fee allocations must total exactly 100%",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  // Move to previous step
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Deploy token
  const handleDeployToken = async () => {
    if (!wallet) {
      toast({
        title: "Wallet connection required",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive"
      });
      return;
    }
    
    // Final validation
    if (!formData.tokenName.trim() || 
        !formData.symbol.trim() || 
        !formData.totalSupply || 
        !formData.mintAuthority.trim() ||
        totalAllocation !== 100) {
      toast({
        title: "Invalid form data",
        description: "Please check all fields and try again",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Simulate token deployment (in a real app, you would call the Solana blockchain here)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a fake token address for demonstration
      const fakeTokenAddress = "So1ana" + Math.random().toString(36).substring(2, 10);
      
      setDeploymentResult({
        success: true,
        tokenAddress: fakeTokenAddress,
        explorerUrl: `https://explorer.solana.com/address/${fakeTokenAddress}?cluster=${formData.network}`
      });
      
      toast({
        title: "Token deployed successfully!",
        description: `Your ${formData.tokenName} token has been created on the ${formData.network}.`,
      });
      
    } catch (error) {
      setDeploymentResult({
        success: false
      });
      
      toast({
        title: "Deployment failed",
        description: (error as Error).message || "An error occurred during token deployment",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setFormData({
      ...defaultFormData,
      mintAuthority: wallet?.address || ''
    });
    setImagePreview(null);
    setCurrentStep(1);
    setDeploymentResult(null);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-mono font-bold">Basic Token Information</h3>
            <p className="text-gray-400 mb-4">Define your token's fundamental attributes</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-sm mb-1 block">Token Name*</label>
                  <BrutalistInput
                    name="tokenName"
                    value={formData.tokenName}
                    onChange={handleChange}
                    placeholder="e.g. Solana AI Token"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-mono text-sm mb-1 block">Symbol*</label>
                  <BrutalistInput
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleChange}
                    placeholder="e.g. SAI"
                    required
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Up to 10 characters, usually all caps</p>
                </div>
                
                <div>
                  <label className="font-mono text-sm mb-1 block">Total Supply*</label>
                  <BrutalistInput
                    type="text"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleChange}
                    placeholder="e.g. 1000000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">The maximum number of tokens that will ever exist</p>
                </div>
                
                <div>
                  <label className="font-mono text-sm mb-1 block">Decimals*</label>
                  <BrutalistInput
                    type="text"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleChange}
                    placeholder="e.g. 9"
                    required
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">The divisibility of your token (9 is standard for Solana)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-sm mb-1 block">Token Image</label>
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-500 flex items-center justify-center rounded-md overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Token preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <i className="ri-image-line text-3xl text-gray-400"></i>
                          <p className="text-xs text-gray-400 mt-2">Upload Image</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <BrutalistInput
                        type="file"
                        id="tokenImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="tokenImage">
                        <BrutalistButton color="default" type="button" className="mb-2" asChild>
                          <span><i className="ri-upload-line mr-2"></i> Upload Image</span>
                        </BrutalistButton>
                      </label>
                      <p className="text-xs text-gray-500">Max 5MB. This will be used for your token listing.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="font-mono text-sm mb-1 block">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your token and its purpose..."
                    className="w-full bg-[#1A1A1A] border-2 border-black text-white p-3 font-mono text-sm rounded-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-mono font-bold">Authority & Ownership</h3>
            <p className="text-gray-400 mb-4">Define who controls your token's supply and features</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-sm mb-1 block">Mint Authority*</label>
                  <BrutalistInput
                    name="mintAuthority"
                    value={formData.mintAuthority}
                    onChange={handleChange}
                    placeholder="e.g. Your wallet address"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Address that can mint new tokens
                    {wallet && (
                      <button 
                        type="button" 
                        className="text-brutalism-blue ml-2"
                        onClick={() => setFormData({...formData, mintAuthority: wallet.address})}
                      >
                        Use my wallet
                      </button>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    id="freezeAuthority"
                    name="freezeAuthority"
                    checked={formData.freezeAuthority}
                    onChange={(e) => setFormData({...formData, freezeAuthority: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="freezeAuthority" className="font-mono text-sm">Enable Freeze Authority</label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Allows the authority to freeze token accounts</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 border-l-4 border-brutalism-yellow">
                <h4 className="font-mono text-sm font-bold mb-2">About Token Authority</h4>
                <p className="text-xs text-gray-400 mb-2">The mint authority has the power to create new tokens after the initial supply is created. This is useful for:</p>
                <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1">
                  <li>Progressive token releases</li>
                  <li>Reward programs</li>
                  <li>Governance-based inflation</li>
                </ul>
                <p className="text-xs text-gray-400 mt-2">Freeze authority can temporarily disable token accounts, useful for regulatory compliance or emergency security measures.</p>
              </div>
            </div>
            
            <BrutalistCard className="p-4 mt-6">
              <h4 className="font-mono text-sm font-bold mb-2">Advanced Authority Options</h4>
              <p className="text-xs text-gray-400 mb-4">Further control options for your token</p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="revokeAuthority"
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="revokeAuthority" className="font-mono text-sm">Revoke Mint Authority After Deploy</label>
                </div>
                <p className="text-xs text-gray-500 ml-6">Once revoked, no one can ever mint new tokens again</p>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="transferAuthority"
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="transferAuthority" className="font-mono text-sm">Transfer Authority to Governance</label>
                </div>
                <p className="text-xs text-gray-500 ml-6">Moves control to a DAO or multi-sig setup (requires additional setup)</p>
              </div>
            </BrutalistCard>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-mono font-bold">Fee Structure & Transaction Features</h3>
            <p className="text-gray-400 mb-4">Configure how your token handles transactions and fees</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-sm mb-1 block">Transaction Fee (%)</label>
                  <BrutalistInput
                    type="text"
                    name="transactionFee"
                    value={formData.transactionFee}
                    onChange={handleChange}
                    placeholder="e.g. 2.5"
                    maxLength={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Percentage fee charged on each transfer (0-10%)</p>
                </div>
                
                <p className="font-mono text-sm mt-4">Fee Allocation (must total 100%)</p>
                
                <div className="flex items-center">
                  <label className="font-mono text-xs w-24">Rewards:</label>
                  <BrutalistInput
                    type="text"
                    name="rewardsAllocation"
                    value={formData.rewardsAllocation}
                    onChange={handleChange}
                    className="w-20 text-center"
                  />
                  <span className="ml-1">%</span>
                </div>
                
                <div className="flex items-center">
                  <label className="font-mono text-xs w-24">Burn:</label>
                  <BrutalistInput
                    type="text"
                    name="burnAllocation"
                    value={formData.burnAllocation}
                    onChange={handleChange}
                    className="w-20 text-center"
                  />
                  <span className="ml-1">%</span>
                </div>
                
                <div className="flex items-center">
                  <label className="font-mono text-xs w-24">Liquidity:</label>
                  <BrutalistInput
                    type="text"
                    name="liquidityAllocation"
                    value={formData.liquidityAllocation}
                    onChange={handleChange}
                    className="w-20 text-center"
                  />
                  <span className="ml-1">%</span>
                </div>
                
                <div className={`mt-2 p-2 text-xs ${totalAllocation === 100 ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'}`}>
                  Total Allocation: {totalAllocation}% {totalAllocation === 100 ? '✓' : '(must equal 100%)'}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-mono text-sm font-bold">Advanced Token Features</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="antiWhale"
                      name="antiWhale"
                      checked={formData.antiWhale}
                      onChange={(e) => setFormData({...formData, antiWhale: e.target.checked})}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="antiWhale" className="font-mono text-sm">Anti-Whale Protection</label>
                  </div>
                  
                  {formData.antiWhale && (
                    <div className="ml-6 space-y-2 mt-2">
                      <div className="flex items-center">
                        <label className="font-mono text-xs w-48">Max Wallet (% of supply):</label>
                        <BrutalistInput
                          type="text"
                          name="maxWalletPercentage"
                          value={formData.maxWalletPercentage}
                          onChange={handleChange}
                          className="w-20 text-center"
                        />
                        <span className="ml-1">%</span>
                      </div>
                      
                      <div className="flex items-center">
                        <label className="font-mono text-xs w-48">Max Transaction (% of supply):</label>
                        <BrutalistInput
                          type="text"
                          name="maxTransactionPercentage"
                          value={formData.maxTransactionPercentage}
                          onChange={handleChange}
                          className="w-20 text-center"
                        />
                        <span className="ml-1">%</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="autoLiquidity"
                      name="autoLiquidity"
                      checked={formData.autoLiquidity}
                      onChange={(e) => setFormData({...formData, autoLiquidity: e.target.checked})}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="autoLiquidity" className="font-mono text-sm">Auto-Liquidity Generation</label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Automatically adds to liquidity pools using the liquidity portion of the fee</p>
                  
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="rewardHolders"
                      name="rewardHolders"
                      checked={formData.rewardHolders}
                      onChange={(e) => setFormData({...formData, rewardHolders: e.target.checked})}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="rewardHolders" className="font-mono text-sm">Reward Token Holders</label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">Distributes the rewards portion of the fee to token holders</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-mono font-bold">Additional Parameters & Metadata</h3>
            <p className="text-gray-400 mb-4">Set network and provide project information for listing</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-sm mb-1 block">Network*</label>
                  <select
                    name="network"
                    value={formData.network}
                    onChange={handleChange}
                    className="w-full bg-[#1A1A1A] border-2 border-black text-white p-3 font-mono text-sm rounded-none"
                  >
                    <option value="devnet">Solana Devnet (Testing)</option>
                    <option value="testnet">Solana Testnet</option>
                    <option value="mainnet">Solana Mainnet</option>
                  </select>
                </div>
                
                <div>
                  <label className="font-mono text-sm mb-1 block">Website</label>
                  <BrutalistInput
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="e.g. https://yourproject.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-sm mb-1 block">Twitter</label>
                    <BrutalistInput
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="@handle"
                    />
                  </div>
                  
                  <div>
                    <label className="font-mono text-sm mb-1 block">Telegram</label>
                    <BrutalistInput
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      placeholder="t.me/group"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="font-mono text-sm mb-1 block">Discord</label>
                  <BrutalistInput
                    name="discord"
                    value={formData.discord}
                    onChange={handleChange}
                    placeholder="discord.gg/invite"
                  />
                </div>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 border-l-4 border-brutalism-blue">
                <h4 className="font-mono text-sm font-bold mb-2">Deployment Notes</h4>
                <ul className="text-xs text-gray-400 list-disc pl-4 space-y-2">
                  <li>Deploying on <strong>devnet</strong> is free and perfect for testing.</li>
                  <li>Deploying on <strong>mainnet</strong> requires SOL for transaction fees.</li>
                  <li>After deployment, you'll receive a token address that can be added to wallets and exchanges.</li>
                  <li>Metadata helps your token get discovered and builds community trust.</li>
                  <li>Consider setting up liquidity pools after deployment to enable trading.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-mono font-bold">Review & Deploy</h3>
            <p className="text-gray-400 mb-4">Review your token configuration before deployment</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrutalistCard className="p-4">
                <h4 className="font-mono text-sm font-bold border-b border-gray-700 pb-2 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Name:</span>
                    <span className="text-sm font-bold">{formData.tokenName}</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Symbol:</span>
                    <span className="text-sm font-bold">{formData.symbol}</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Supply:</span>
                    <span className="text-sm">{Number(formData.totalSupply).toLocaleString()}</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Decimals:</span>
                    <span className="text-sm">{formData.decimals}</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Network:</span>
                    <span className="text-sm capitalize">{formData.network}</span>
                  </div>
                </div>

                <h4 className="font-mono text-sm font-bold border-b border-gray-700 pb-2 mb-3 mt-6">Authority</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Mint Auth:</span>
                    <span className="text-sm break-all">{formatWalletAddress(formData.mintAuthority)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-mono text-xs w-24">Freeze Auth:</span>
                    <span className="text-sm">{formData.freezeAuthority ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </BrutalistCard>
              
              <BrutalistCard className="p-4">
                <h4 className="font-mono text-sm font-bold border-b border-gray-700 pb-2 mb-3">Transaction Features</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-mono text-xs w-36">Transaction Fee:</span>
                    <span className="text-sm">{formData.transactionFee}%</span>
                  </div>
                  
                  <div className="ml-4 mt-2">
                    <div className="flex">
                      <span className="font-mono text-xs w-24">→ Rewards:</span>
                      <span className="text-sm">{formData.rewardsAllocation}%</span>
                    </div>
                    <div className="flex">
                      <span className="font-mono text-xs w-24">→ Burn:</span>
                      <span className="text-sm">{formData.burnAllocation}%</span>
                    </div>
                    <div className="flex">
                      <span className="font-mono text-xs w-24">→ Liquidity:</span>
                      <span className="text-sm">{formData.liquidityAllocation}%</span>
                    </div>
                  </div>
                </div>

                <h4 className="font-mono text-sm font-bold border-b border-gray-700 pb-2 mb-3 mt-6">Advanced Features</h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-mono text-xs w-36">Anti-Whale:</span>
                    <span className="text-sm">{formData.antiWhale ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  
                  {formData.antiWhale && (
                    <div className="ml-4">
                      <div className="flex">
                        <span className="font-mono text-xs w-36">→ Max Wallet:</span>
                        <span className="text-sm">{formData.maxWalletPercentage}% of supply</span>
                      </div>
                      <div className="flex">
                        <span className="font-mono text-xs w-36">→ Max Transaction:</span>
                        <span className="text-sm">{formData.maxTransactionPercentage}% of supply</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex">
                    <span className="font-mono text-xs w-36">Auto-Liquidity:</span>
                    <span className="text-sm">{formData.autoLiquidity ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="font-mono text-xs w-36">Reward Holders:</span>
                    <span className="text-sm">{formData.rewardHolders ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </BrutalistCard>
            </div>
            
            <div className="bg-[#1A1A1A] p-4 border-l-4 border-brutalism-red mt-4">
              <div className="flex items-start">
                <i className="ri-error-warning-line text-brutalism-red text-xl mr-2"></i>
                <div>
                  <h4 className="font-mono text-sm font-bold">Deployment Warning</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Once deployed, many token parameters cannot be changed. Deploy first on devnet to test functionality 
                    before deploying to mainnet. Deploying to mainnet will require SOL for transaction fees.
                  </p>
                </div>
              </div>
            </div>
            
            {!wallet && (
              <div className="bg-[#1A1A1A] p-4 border-l-4 border-brutalism-yellow mt-4">
                <div className="flex items-start">
                  <i className="ri-wallet-3-line text-brutalism-yellow text-xl mr-2"></i>
                  <div>
                    <h4 className="font-mono text-sm font-bold">Wallet Required</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      You need to connect a wallet to deploy your token. Click the Connect Wallet button in the header.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {deploymentResult && (
              <BrutalistCard className={`p-6 ${deploymentResult.success ? 'border-l-4 border-brutalism-green' : 'border-l-4 border-brutalism-red'}`}>
                <div className="flex items-start">
                  <i className={`${deploymentResult.success ? 'ri-check-line text-brutalism-green' : 'ri-close-line text-brutalism-red'} text-2xl mr-3`}></i>
                  <div>
                    <h3 className="text-lg font-mono font-bold">
                      {deploymentResult.success ? 'Deployment Successful!' : 'Deployment Failed'}
                    </h3>
                    
                    {deploymentResult.success && deploymentResult.tokenAddress && (
                      <div className="mt-3">
                        <div className="mb-2">
                          <span className="font-mono text-xs">Token Address:</span>
                          <code className="block bg-[#111] p-2 mt-1 text-sm break-all font-mono">{deploymentResult.tokenAddress}</code>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          <BrutalistButton color="blue" className="text-xs">
                            <i className="ri-external-link-line mr-1"></i> View on Explorer
                          </BrutalistButton>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <BrutalistButton color="purple" className="text-xs">
                                <i className="ri-information-line mr-1"></i> Token Details
                              </BrutalistButton>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1E1E1E] border-4 border-black">
                              <DialogHeader>
                                <DialogTitle>{formData.tokenName} ({formData.symbol}) Details</DialogTitle>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div>
                                  <h4 className="text-sm font-bold">Token Address</h4>
                                  <code className="block bg-[#111] p-2 mt-1 text-sm break-all font-mono">{deploymentResult.tokenAddress}</code>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-bold">Network</h4>
                                  <p className="text-sm capitalize">{formData.network}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-bold">Add to Wallet</h4>
                                  <p className="text-sm mt-1">Use the token address to add this token to your wallet.</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-bold">Next Steps</h4>
                                  <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                                    <li>Create a liquidity pool</li>
                                    <li>Submit for listing on exchanges</li>
                                    <li>Update your community</li>
                                  </ul>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <BrutalistButton color="default" className="text-xs" onClick={handleReset}>
                            <i className="ri-refresh-line mr-1"></i> Create Another Token
                          </BrutalistButton>
                        </div>
                      </div>
                    )}
                    
                    {!deploymentResult.success && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">There was an error deploying your token. Please try again.</p>
                        <BrutalistButton color="default" className="text-xs mt-4" onClick={() => setDeploymentResult(null)}>
                          <i className="ri-refresh-line mr-1"></i> Try Again
                        </BrutalistButton>
                      </div>
                    )}
                  </div>
                </div>
              </BrutalistCard>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <Header title="Token Creator" wallet={wallet} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-mono font-bold">Create Your Solana Token</h2>
        
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="standard" className="w-[400px]">
            <TabsList className="mb-2">
              <TabsTrigger value="standard">Standard Token</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <BrutalistCard className="p-6 mb-8">
        <div className="flex mb-6">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step}
              className={`flex-1 h-2 mx-1 ${currentStep >= step ? 'bg-brutalism-blue' : 'bg-[#333]'}`}
            />
          ))}
        </div>
        
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <BrutalistButton 
                type="button" 
                color="default"
                onClick={goToPreviousStep}
              >
                <i className="ri-arrow-left-line mr-2"></i> Previous
              </BrutalistButton>
            )}
            
            <div className="ml-auto">
              {currentStep < 5 ? (
                <BrutalistButton 
                  type="button" 
                  color="blue"
                  onClick={goToNextStep}
                >
                  Next <i className="ri-arrow-right-line ml-2"></i>
                </BrutalistButton>
              ) : (
                <BrutalistButton 
                  type="button" 
                  color="green"
                  onClick={handleDeployToken}
                  disabled={isDeploying || !!deploymentResult}
                >
                  {isDeploying ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i> Deploying...
                    </>
                  ) : (
                    <>
                      <i className="ri-rocket-line mr-2"></i> Deploy Token
                    </>
                  )}
                </BrutalistButton>
              )}
            </div>
          </div>
        </form>
      </BrutalistCard>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BrutalistCard className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brutalism-blue border-2 border-black mr-3">
              <i className="ri-file-list-3-line text-white"></i>
            </div>
            <h3 className="font-mono font-bold">Simple Creation</h3>
          </div>
          <p className="text-sm text-gray-400">
            Our step-by-step process makes it easy to create Solana tokens without writing a single line of code. Just fill in your parameters and deploy.
          </p>
        </BrutalistCard>
        
        <BrutalistCard className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brutalism-green border-2 border-black mr-3">
              <i className="ri-shield-check-line text-white"></i>
            </div>
            <h3 className="font-mono font-bold">Advanced Security</h3>
          </div>
          <p className="text-sm text-gray-400">
            Built-in protections like anti-whale mechanics, transaction limits, and automatic liquidity management keep your token ecosystem healthy.
          </p>
        </BrutalistCard>
        
        <BrutalistCard className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brutalism-purple border-2 border-black mr-3">
              <i className="ri-line-chart-line text-white"></i>
            </div>
            <h3 className="font-mono font-bold">Tokenomics Design</h3>
          </div>
          <p className="text-sm text-gray-400">
            Custom fee distributions let you design powerful tokenomics that automatically reward holders, burn tokens, and build liquidity.
          </p>
        </BrutalistCard>
      </div>
    </div>
  );
};

export default TokenCreator;
