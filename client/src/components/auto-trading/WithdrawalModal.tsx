import React, { useState, useEffect } from 'react';
import { useSolanaVerifier, VerificationStatus } from '@/lib/solanaVerifier';
import { Loader2, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: () => void;
  profitAmount: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ 
  isOpen, 
  onClose,
  onWithdraw,
  profitAmount
}) => {
  const [txId, setTxId] = useState('');
  const [step, setStep] = useState<'info' | 'payment' | 'verification' | 'complete'>('info');
  const { verificationStatus, verifyTransaction, resetVerification } = useSolanaVerifier();
  
  // Close modal handler with cleanup
  const handleClose = () => {
    resetVerification();
    setTxId('');
    setStep('info');
    onClose();
  };

  // Handle TxID input
  const handleVerifyTransaction = async () => {
    setStep('verification');
    await verifyTransaction(txId);
    // Move to completion step after verification (whether successful or not)
    setStep('complete');
  };
  
  // Finalize withdrawal after verification
  const handleFinalizeWithdrawal = () => {
    if (verificationStatus.verified) {
      onWithdraw();
    }
    handleClose();
  };
  
  // Reset if modal is closed
  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="w-full max-w-md mx-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-black p-4">
          <h2 className="text-xl font-mono font-bold text-white">
            {step === 'info' && 'Withdraw Trading Profits'}
            {step === 'payment' && 'Fee Payment Required'}
            {step === 'verification' && 'Verifying Transaction'}
            {step === 'complete' && (verificationStatus.verified ? 'Withdrawal Success' : 'Verification Failed')}
          </h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-300 font-bold text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6">
          {/* Step 1: Info */}
          {step === 'info' && (
            <>
              <div className="bg-gray-100 border-2 border-black p-4 mb-4">
                <h3 className="font-mono font-bold mb-2">WITHDRAWAL DETAILS</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Profit:</span>
                    <span className="font-bold text-brutalism-green">${profitAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Fee:</span>
                    <span className="font-bold">0.5 SOL</span>
                  </div>
                  <div className="border-t border-gray-300 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">You Will Receive:</span>
                    <span className="font-bold text-brutalism-green">${profitAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-500 p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 mt-1 w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Important</p>
                    <p className="text-sm text-yellow-600">
                      To withdraw profits, you must first pay a 0.5 SOL network processing fee. 
                      This fee helps maintain our secure trade execution network.
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setStep('payment')}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold text-center transform transition hover:translate-y-[2px]"
              >
                Continue to Payment
              </button>
            </>
          )}
          
          {/* Step 2: Payment Instructions */}
          {step === 'payment' && (
            <>
              <div className="bg-gray-100 border-2 border-black p-4 mb-4">
                <h3 className="font-mono font-bold mb-2">PAYMENT INSTRUCTIONS</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Send exactly <span className="font-bold">0.5 SOL</span> to this address:</li>
                  <div className="bg-white border border-gray-300 p-2 my-1 rounded-sm font-mono text-sm break-all">
                    6B2RkaJevbKkAVmBZ4W2eNvQWApHwtd6TQggSuTmyVJ5
                  </div>
                  <li>Wait for transaction to be confirmed (at least 1 confirmation)</li>
                  <li>Copy the transaction ID and paste it below</li>
                </ol>
              </div>
              
              <label className="block mb-2 font-mono text-sm">
                Transaction ID:
                <input
                  type="text"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Enter your Solana transaction ID"
                  className="w-full border-2 border-black p-2 mt-1 font-mono text-sm"
                />
              </label>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setStep('info')}
                  className="py-2 px-4 border-2 border-black bg-white hover:bg-gray-100 text-black font-bold transform transition hover:translate-y-[2px]"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyTransaction}
                  disabled={!txId.trim()}
                  className={`py-2 px-4 border-2 border-black bg-black hover:bg-gray-800 text-white font-bold transform transition hover:translate-y-[2px] ${
                    !txId.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Verify Transaction
                </button>
              </div>
            </>
          )}
          
          {/* Step 3: Verification */}
          {step === 'verification' && (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-brutalism-blue animate-spin mb-4" />
              <p className="text-center font-mono">
                Verifying your transaction on the Solana blockchain...
              </p>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This usually takes 15-30 seconds. Please don't close this window.
              </p>
            </div>
          )}
          
          {/* Step 4: Complete (Success or Failed) */}
          {step === 'complete' && (
            <>
              {verificationStatus.verified ? (
                <div className="bg-green-50 border-2 border-green-500 p-4 mb-4">
                  <div className="flex">
                    <CheckCircle2 className="text-green-500 mr-3 w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-green-700">Transaction Verified!</h3>
                      <p className="text-sm text-green-600 mt-1">
                        Your payment of 0.5 SOL has been verified on the Solana blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <XCircle className="text-red-500 mr-3 w-6 h-6" />
                    <div>
                      <h3 className="font-bold text-red-700">Verification Failed</h3>
                      <p className="text-sm text-red-600 mt-1">
                        {verificationStatus.message || "We couldn't verify your transaction. Please check the transaction ID and try again."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transaction Details (if verified) */}
              {verificationStatus.verified && verificationStatus.txDetails && (
                <div className="bg-gray-100 border-2 border-black p-4 mb-4">
                  <h3 className="font-mono font-bold mb-2">TRANSACTION DETAILS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-mono">{verificationStatus.txDetails.sender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-mono">{verificationStatus.txDetails.receiver?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold">{verificationStatus.txDetails.amount} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmations:</span>
                      <span>{verificationStatus.txDetails.blockConfirmations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span>{verificationStatus.txDetails.timestamp?.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Final Action Button */}
              <button
                onClick={handleFinalizeWithdrawal}
                className={`w-full py-3 font-bold text-center transform transition hover:translate-y-[2px] ${
                  verificationStatus.verified
                    ? 'bg-brutalism-green hover:bg-green-700 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-black'
                }`}
              >
                {verificationStatus.verified ? 'Complete Withdrawal' : 'Try Again'}
              </button>
              
              {/* Explorer Link */}
              {txId && (
                <div className="text-center mt-3">
                  <a 
                    href={`https://explorer.solana.com/tx/${txId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brutalism-blue hover:underline text-sm inline-flex items-center"
                  >
                    View on Solana Explorer
                    <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;