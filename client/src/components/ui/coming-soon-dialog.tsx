import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrutalistButton } from "@/components/ui/brutalist-button";

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

const ComingSoonDialog: React.FC<ComingSoonDialogProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono font-bold">
            Coming Soon!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            The <span className="font-bold">{feature}</span> feature is coming soon. We're working hard to bring this to you as quickly as possible.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-yellow-100 border-2 border-yellow-600 rounded-md mt-4">
          <p className="text-yellow-700 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            This feature is under development and will be available soon!
          </p>
        </div>
        
        <div className="flex justify-end mt-6">
          <BrutalistButton 
            color="blue"
            onClick={onClose}
            className="px-5 py-2"
          >
            Got it!
          </BrutalistButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;