import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, FileCode, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTransactionHistory, type RealTransaction } from "@/hooks/useTransactionHistory";

const iconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  contract: FileCode,
};

const HistoryPage = () => {
  const { isConnected } = useAccount();
  const { transactions, isLoading, error } = useTransactionHistory(50);

  return (
    <div className="min-h-svh bg-background flex">
      <DashboardSidebar />
      <main className="mt-14 md:mt-0 md:ml-[240px] flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              Transaction History
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Real transactions from Base mainnet.
            </p>

            {!isConnected ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">Connect your wallet to view transaction history.</p>
              </div>
            ) : isLoading ? (
              <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-muted-foreground">Loading transactions...</span>
              </div>
            ) : error ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">No transactions found on Base.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="divide-y divide-border">
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
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                            <Icon
                              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground capitalize">
                                {tx.type}
                              </span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  tx.status === "success"
                                    ? "bg-success/10 text-success"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                              >
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
                              {tx.type === "send" ? "-" : "+"}
                              {tx.amount} {tx.token}
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
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
