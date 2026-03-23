export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: `0x${string}` | null;
  logoColor: string;
}

export const BASE_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", decimals: 18, address: null, logoColor: "hsl(var(--primary))" },
  { symbol: "WETH", name: "Wrapped ETH", decimals: 18, address: "0x4200000000000000000000000000000000000006", logoColor: "#627EEA" },
  { symbol: "USDC", name: "USD Coin", decimals: 6, address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", logoColor: "#2775CA" },
  { symbol: "USDbC", name: "USD Base Coin", decimals: 6, address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", logoColor: "#2775CA" },
  { symbol: "DAI", name: "Dai Stablecoin", decimals: 18, address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", logoColor: "#F5AC37" },
  { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", decimals: 18, address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", logoColor: "#0052FF" },
];

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export const WETH_ABI = [
  { name: "deposit", type: "function", inputs: [], outputs: [], stateMutability: "payable" },
  { name: "withdraw", type: "function", inputs: [{ name: "wad", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
] as const;
