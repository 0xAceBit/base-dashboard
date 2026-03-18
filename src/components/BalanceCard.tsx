import { motion } from "framer-motion";

const BalanceCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="p-8 bg-card border border-border rounded-2xl shadow-card"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Total Balance
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <h1 className="text-5xl font-bold tracking-tighter font-mono-nums text-foreground">
          1.4280
        </h1>
        <span className="text-xl font-medium text-muted-foreground">ETH</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Base</span>
          <span className="text-sm font-mono-nums text-foreground">0.8420</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-sm text-muted-foreground">USDC</span>
          <span className="text-sm font-mono-nums text-foreground">$1,842.00</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
