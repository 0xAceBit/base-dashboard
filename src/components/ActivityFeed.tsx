import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react";

type TxStatus = "success" | "pending";

interface Transaction {
  id: string;
  type: "send" | "receive" | "bridge";
  amount: string;
  token: string;
  address: string;
  time: string;
  status: TxStatus;
  gas: string;
}

const mockTxs: Transaction[] = [
  { id: "1", type: "send", amount: "0.15", token: "ETH", address: "0x1a2b...9f3e", time: "2 min ago", status: "success", gas: "$0.0012" },
  { id: "2", type: "receive", amount: "500.00", token: "USDC", address: "0x8c4d...2a1b", time: "18 min ago", status: "success", gas: "$0.0008" },
  { id: "3", type: "bridge", amount: "0.50", token: "ETH", address: "Ethereum → Base", time: "1 hr ago", status: "pending", gas: "$0.42" },
  { id: "4", type: "send", amount: "0.02", token: "ETH", address: "0x5e7f...c8d4", time: "3 hrs ago", status: "success", gas: "$0.0014" },
  { id: "5", type: "receive", amount: "1,200.00", token: "USDC", address: "0x3b6a...7e2c", time: "5 hrs ago", status: "success", gas: "$0.0009" },
];

const iconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  bridge: Repeat,
};

const ActivityFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
        Activity
      </h2>
      <div className="space-y-1">
        {mockTxs.map((tx, i) => {
          const Icon = iconMap[tx.type];
          return (
            <motion.div
              key={tx.id}
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
                    {tx.status === "pending" && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{tx.address}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono-nums text-foreground">
                  {tx.type === "send" ? "-" : "+"}{tx.amount} {tx.token}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs text-muted-foreground">{tx.time}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">Gas {tx.gas}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActivityFeed;
