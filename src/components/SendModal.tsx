import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import { base } from "wagmi/chains";

interface SendModalProps {
  open: boolean;
  onClose: () => void;
}

const SendModal = ({ open, onClose }: SendModalProps) => {
  const { isConnected } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSend = () => {
    if (!isAddress(to) || !amount || parseFloat(amount) <= 0) return;
    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
      chainId: base.id,
    });
  };

  const handleClose = () => {
    setTo("");
    setAmount("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Send ETH</h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono-nums text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (ETH)</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono-nums text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {isSuccess && txHash && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success flex items-center gap-2">
                ✓ Sent!
                <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline ml-auto">
                  View tx
                </a>
              </div>
            )}
            {isError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Transaction failed.
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={!isConnected || !isAddress(to) || !amount || parseFloat(amount) <= 0 || isPending}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:shadow-primary-glow transition-shadow"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </span>
              ) : !isConnected ? "Connect Wallet" : "Send"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SendModal;
