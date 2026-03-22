import { motion } from "framer-motion";
import { Zap, TrendingUp, Loader2 } from "lucide-react";
import { useEthPrice } from "@/hooks/useEthPrice";

const NetworkStatus = () => {
  const { price, isLoading } = useEthPrice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="p-5 bg-secondary border border-border rounded-xl"
    >
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
        Network
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-success" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">Gas</span>
          </div>
          <span className="text-sm font-mono-nums text-foreground">0.001 gwei</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">ETH</span>
          </div>
          <span className="text-sm font-mono-nums text-foreground">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin inline" />
            ) : price ? (
              `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <span className="text-sm text-success font-medium">Operational</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkStatus;
