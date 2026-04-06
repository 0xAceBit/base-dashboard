import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";

// Builder Code attribution for Base
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_g4283rce"],
});

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors: [
    // injected() auto-detects all installed browser wallets:
    // Phantom, OKX, Keplr, Rabby, Trust, Brave, etc.
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "Baselyt" }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
});
