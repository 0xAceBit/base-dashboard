import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, FileCode, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

const iconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  contract: FileCode,
};

const ActivityFeed = () => {
  const { isConnected } = useAccount();
  const { transactions, isLoading } = useTransactionHistory(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
        Recent Activity
      </h2>

      {!isConnected ? (
        <div className="p-6 text-center text-sm text-muted-foreground bg-secondary rounded-xl border border-border">
          Connect wallet to see activity.
        </div>
      ) : isLoading ? (
        <div className="p-6 text-center text-sm text-muted-foreground bg-secondary rounded-xl border border-border animate-pulse">
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground bg-secondary rounded-xl border border-border">
          No transactions found on Base.
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx, i) => {
            const Icon = iconMap[tx.type];
            return (
              <motion.a
                key={tx.hash}
                href={`https://basescan.org/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground capitalize">{tx.type}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        tx.status === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono-nums">
                      {tx.type === "send" ? `To: ${tx.to}` : `From: ${tx.from}`}
                    </span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-sm font-mono-nums text-foreground">
                      {tx.type === "send" ? "-" : "+"}{tx.amount} {tx.token}
                    </span>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-muted-foreground">{tx.time}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Gas {tx.gas}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
