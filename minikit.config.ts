const ROOT_URL = "https://baselyt.lovable.app";

export const minikitConfig = {
  accountAssociation: {
    "header": "",
    "payload": "",
    "signature": ""
  },
  miniapp: {
    version: "1",
    name: "Baselyt",
    subtitle: "Your Base Dashboard and Swaps",
    description: "A real-time Base mainnet dashboard for tracking balances, swapping tokens, sending transactions, and viewing on-chain activity — all from one place.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/favicon.ico`,
    splashImageUrl: `${ROOT_URL}/og-image.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["defi", "base", "wallet", "swap", "dashboard"],
    heroImageUrl: `${ROOT_URL}/og-image.png`,
    tagline: "Your Base Dashboard and Swaps",
    ogTitle: "Baselyt — Base Mainnet Dashboard",
    ogDescription: "Track balances, swap tokens, and manage transactions on Base mainnet.",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;
