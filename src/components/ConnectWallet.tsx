import { motion, AnimatePresence } from "framer-motion";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

const WALLET_ICONS: Record<string, string> = {
  metamask: "🦊",
  "coinbase wallet": "🔵",
  phantom: "👻",
  "okx wallet": "⬡",
  keplr: "🔑",
  rabby: "🐰",
  "trust wallet": "🛡️",
  "brave wallet": "🦁",
};

const getWalletIcon = (name: string) => {
  const key = name.toLowerCase();
  for (const [walletKey, icon] of Object.entries(WALLET_ICONS)) {
    if (key.includes(walletKey)) return icon;
  }
  return null;
};

const ConnectWallet = () => {
  const { connectors, connect, isPending } = useConnect();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);

  // Deduplicate connectors by name (injected can overlap with MetaMask etc.)
  const uniqueConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((c) => {
      const name = c.name.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [connectors]);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 w-full cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col text-left flex-1">
            <span className="text-xs font-medium text-foreground font-mono-nums">
              {truncateAddress(address)}
            </span>
            <span className="text-xs text-muted-foreground">
              {chain?.name ?? "Unknown"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl p-1.5 shadow-card z-20"
            >
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-secondary transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {uniqueConnectors.map((connector) => {
        const icon = getWalletIcon(connector.name);
        return (
          <motion.button
            key={connector.uid}
            whileTap={{ scale: 0.98 }}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                       text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50
                       transition-colors cursor-pointer disabled:opacity-50"
          >
            {icon ? (
              <span className="text-base w-4 text-center leading-none">{icon}</span>
            ) : (
              <Wallet className="w-4 h-4" strokeWidth={1.5} />
            )}
            {connector.name}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ConnectWallet;
