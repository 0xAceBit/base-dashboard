import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import type { Token } from "@/lib/tokens";
import { BASE_CHAIN_ID, PARASWAP_NATIVE_TOKEN } from "@/lib/tokens";

interface ParaswapPriceRoute {
  srcAmount: string;
  destAmount: string;
  tokenTransferProxy?: string;
  [key: string]: unknown;
}

interface ParaswapQuote {
  srcAmount: bigint;
  destAmount: bigint;
  spender: `0x${string}` | null;
  priceRoute: ParaswapPriceRoute;
}

interface UseParaswapQuoteParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  userAddress?: `0x${string}`;
}

function getApiErrorMessage(payload: unknown) {
  if (typeof payload === "object" && payload !== null) {
    const data = payload as Record<string, unknown>;
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
  }
  return "Failed to fetch swap quote.";
}

export function useParaswapQuote({ fromToken, toToken, amount, userAddress }: UseParaswapQuoteParams) {
  const [quote, setQuote] = useState<ParaswapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!amount || Number(amount) <= 0 || fromToken.symbol === toToken.symbol) {
        setQuote(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      let sellAmount: bigint;
      try {
        sellAmount = parseUnits(amount, fromToken.decimals);
      } catch {
        setQuote(null);
        setError("Invalid amount for selected token.");
        setIsLoading(false);
        return;
      }

      if (sellAmount <= 0n) {
        setQuote(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const sellToken = fromToken.address ?? PARASWAP_NATIVE_TOKEN;
        const buyToken = toToken.address ?? PARASWAP_NATIVE_TOKEN;

        const params = new URLSearchParams({
          srcToken: sellToken,
          destToken: buyToken,
          amount: sellAmount.toString(),
          side: "SELL",
          network: String(BASE_CHAIN_ID),
        });

        if (userAddress) {
          params.append("userAddress", userAddress);
        }

        const res = await fetch(`https://apiv5.paraswap.io/prices?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = await res.json();

        if (!res.ok) {
          throw new Error(getApiErrorMessage(payload));
        }

        const priceRoute = (payload as { priceRoute?: ParaswapPriceRoute }).priceRoute;
        if (!priceRoute?.srcAmount || !priceRoute?.destAmount) {
          throw new Error("Quote unavailable for this pair right now.");
        }

        const spender = typeof priceRoute.tokenTransferProxy === "string"
          ? (priceRoute.tokenTransferProxy as `0x${string}`)
          : null;

        setQuote({
          srcAmount: BigInt(priceRoute.srcAmount),
          destAmount: BigInt(priceRoute.destAmount),
          spender,
          priceRoute,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setQuote(null);
        setError(err instanceof Error ? err.message : "Failed to fetch swap quote.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [amount, fromToken, toToken, userAddress]);

  return { quote, isLoading, error };
}
