import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useEthPrice } from "@/hooks/useEthPrice";

export interface RealTransaction {
  hash: string;
  type: "send" | "receive" | "contract";
  amount: string;
  token: string;
  from: string;
  to: string;
  time: string;
  status: "success" | "failed";
  gas: string;
  blockNumber: string;
}

const BLOCKSCOUT_API = "https://base.blockscout.com/api/v2";
const BASESCAN_V1_API = "https://api.basescan.org/api";
const BASESCAN_API_KEY = "Y8WY21V1H4K7QFIKAIWI4939DD8R3IZ39S";

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function truncateAddress(addr: string): string {
  if (!addr) return "Unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function safeBigInt(value: unknown): bigint {
  try {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") return BigInt(value);
    if (typeof value === "string" && value.length > 0) return BigInt(value);
    return 0n;
  } catch {
    return 0n;
  }
}

function toUsdLabel(wei: bigint, ethPrice: number | null): string {
  const usd = parseFloat(formatEther(wei)) * (ethPrice ?? 0);
  return `$${usd.toFixed(4)}`;
}

type BlockscoutTx = {
  hash: string;
  value: string;
  timestamp: string;
  status?: string;
  result?: string;
  block_number?: number;
  from?: { hash?: string };
  to?: { hash?: string };
  fee?: { value?: string };
};

type BasescanTx = {
  hash: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  from: string;
  to: string;
  timeStamp: string;
  blockNumber: string;
  isError?: string;
  txreceipt_status?: string;
};

async function fetchFromBlockscout(
  address: string,
  limit: number,
  ethPrice: number | null
): Promise<RealTransaction[]> {
  const response = await fetch(
    `${BLOCKSCOUT_API}/addresses/${address}/transactions?items_count=${limit}`
  );

  if (!response.ok) {
    throw new Error(`Blockscout request failed (${response.status})`);
  }

  const data = await response.json();
  const items: BlockscoutTx[] = Array.isArray(data?.items) ? data.items : [];
  const normalizedAddress = address.toLowerCase();

  return items.map((tx) => {
    const fromHash = tx.from?.hash ?? "";
    const toHash = tx.to?.hash ?? "";
    const isSend = fromHash.toLowerCase() === normalizedAddress;
    const valueWei = safeBigInt(tx.value);
    const gasWei = safeBigInt(tx.fee?.value);
    const timestamp = Math.floor(new Date(tx.timestamp).getTime() / 1000);

    return {
      hash: tx.hash,
      type: !toHash ? "contract" : isSend ? "send" : "receive",
      amount: parseFloat(formatEther(valueWei)).toFixed(6),
      token: "ETH",
      from: truncateAddress(fromHash),
      to: toHash ? truncateAddress(toHash) : "Contract Creation",
      time: Number.isFinite(timestamp) ? timeAgo(timestamp) : "--",
      status: tx.status === "ok" || tx.result === "success" ? "success" : "failed",
      gas: toUsdLabel(gasWei, ethPrice),
      blockNumber: tx.block_number ? String(tx.block_number) : "-",
    };
  });
}

async function fetchFromBasescanV1(
  address: string,
  limit: number,
  ethPrice: number | null
): Promise<RealTransaction[]> {
  const response = await fetch(
    `${BASESCAN_V1_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${BASESCAN_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Basescan request failed (${response.status})`);
  }

  const data = await response.json();

  if (data?.status !== "1" || !Array.isArray(data?.result)) {
    const reason =
      typeof data?.result === "string" ? data.result : "Basescan returned an invalid response.";
    throw new Error(reason);
  }

  return (data.result as BasescanTx[]).map((tx) => {
    const fromAddr = tx.from ?? "";
    const toAddr = tx.to ?? "";
    const isSend = fromAddr.toLowerCase() === address.toLowerCase();
    const valueWei = safeBigInt(tx.value);
    const gasWei = safeBigInt(tx.gasUsed) * safeBigInt(tx.gasPrice);

    return {
      hash: tx.hash,
      type: toAddr === "" ? "contract" : isSend ? "send" : "receive",
      amount: parseFloat(formatEther(valueWei)).toFixed(6),
      token: "ETH",
      from: truncateAddress(fromAddr),
      to: toAddr ? truncateAddress(toAddr) : "Contract Creation",
      time: timeAgo(parseInt(tx.timeStamp, 10)),
      status: tx.isError === "1" || tx.txreceipt_status === "0" ? "failed" : "success",
      gas: toUsdLabel(gasWei, ethPrice),
      blockNumber: tx.blockNumber,
    };
  });
}

export function useTransactionHistory(limit = 20) {
  const { address, isConnected } = useAccount();
  const { price: ethPrice } = useEthPrice();
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setTransactions([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchTxs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Primary source: Blockscout (works on Base without paid Etherscan V2 access)
        const txs = await fetchFromBlockscout(address, limit, ethPrice);
        if (!cancelled) {
          setTransactions(txs);
        }
      } catch (blockscoutError) {
        try {
          // Fallback: Basescan V1 with API key
          const txs = await fetchFromBasescanV1(address, limit, ethPrice);
          if (!cancelled) {
            setTransactions(txs);
          }
        } catch (basescanError) {
          if (!cancelled) {
            setTransactions([]);
            setError("Unable to fetch Base transactions right now.");
          }
          console.error("Transaction history fetch failed", {
            blockscoutError,
            basescanError,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTxs();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, limit, ethPrice]);

  return { transactions, isLoading, error };
}
