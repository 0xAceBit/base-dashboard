import { motion } from "framer-motion";
import { useAccount, useBalance } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits } from "viem";

const BalanceCard = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id,
  });

  const formattedEth = ethBalance
    ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)
    : "0.0000";

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
          {isConnected ? formattedEth : "—"}
        </h1>
        <span className="text-xl font-medium text-muted-foreground">ETH</span>
      </div>
      {!isConnected && (
        <p className="mt-3 text-sm text-muted-foreground">
          Connect your wallet to view balances.
        </p>
      )}
      {isConnected && (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Base</span>
            <span className="text-sm font-mono-nums text-foreground">{formattedEth}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BalanceCard;
