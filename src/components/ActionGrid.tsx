import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Repeat, Coins } from "lucide-react";

const actions = [
  { label: "Send", icon: ArrowUpRight, description: "Transfer tokens" },
  { label: "Receive", icon: ArrowDownLeft, description: "Get your address" },
  { label: "Bridge", icon: Repeat, description: "Fast bridge to Base" },
  { label: "Mint", icon: Coins, description: "Mint on Base" },
];

const ActionGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-start gap-2 p-5 bg-secondary border border-border rounded-xl
                     transition-colors duration-150 hover:bg-accent cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <action.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-foreground">{action.label}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default ActionGrid;
