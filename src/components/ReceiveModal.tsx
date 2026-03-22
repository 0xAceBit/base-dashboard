import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { useAccount } from "wagmi";
import { useState } from "react";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
}

const ReceiveModal = ({ open, onClose }: ReceiveModalProps) => {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Receive</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isConnected && address ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share your Base address to receive tokens.
                </p>
                <div className="bg-secondary border border-border rounded-xl p-4 flex items-center gap-3">
                  <span className="text-sm font-mono-nums text-foreground break-all flex-1">
                    {address}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only send assets on the <span className="text-foreground font-medium">Base</span> network to this address.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Connect your wallet to see your address.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiveModal;
