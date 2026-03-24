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

const BASESCAN_API = "https://api.basescan.org/api";

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
      return;
    }

    const fetchTxs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASESCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=YourApiKeyToken`
        );
        const data = await res.json();
        
        if (data.status === "1" && Array.isArray(data.result)) {
          const txs: RealTransaction[] = data.result.map((tx: any) => {
            const isSend = tx.from.toLowerCase() === address.toLowerCase();
            const value = formatEther(BigInt(tx.value || "0"));
            const gasUsed = BigInt(tx.gasUsed || "0");
            const gasPrice = BigInt(tx.gasPrice || "0");
            const gasCost = formatEther(gasUsed * gasPrice);

            return {
              hash: tx.hash,
              type: tx.to === "" ? "contract" : isSend ? "send" : "receive",
              amount: parseFloat(value).toFixed(6),
              token: "ETH",
              from: truncateAddress(tx.from),
              to: tx.to ? truncateAddress(tx.to) : "Contract Creation",
              time: timeAgo(parseInt(tx.timeStamp)),
              status: tx.txreceipt_status === "1" ? "success" : "failed",
              gas: `$${(parseFloat(gasCost) * (ethPrice || 0)).toFixed(4)}`,
              blockNumber: tx.blockNumber,
            };
          });
          setTransactions(txs);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        setError("Failed to fetch transactions");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTxs();
  }, [address, isConnected, limit, ethPrice]);

  return { transactions, isLoading, error };
}
