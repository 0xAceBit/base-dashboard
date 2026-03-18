import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "Base Layer" }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});
