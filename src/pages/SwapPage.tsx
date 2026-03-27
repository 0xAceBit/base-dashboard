import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2, AlertCircle } from "lucide-react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { encodeFunctionData, formatUnits } from "viem";
import { base } from "wagmi/chains";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  BASE_CHAIN_ID,
  BASE_TOKENS,
  ERC20_ABI,
  PARASWAP_NATIVE_TOKEN,
  ZERO_ADDRESS,
} from "@/lib/tokens";
import { useParaswapQuote } from "@/hooks/useParaswapQuote";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TxStatus = "idle" | "approving" | "swapping" | "success" | "error";

interface ParaswapTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  gas?: string;
  gasPrice?: string;
}

const formatDisplayAmount = (value: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.0";
  if (num === 0) return "0.0";
  if (num < 0.000001) return "<0.000001";
  return num.toFixed(6);
};

const SwapPage = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [swapError, setSwapError] = useState<string | null>(null);
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>();
  const [swapHash, setSwapHash] = useState<`0x${string}` | undefined>();

  const fromToken = BASE_TOKENS[fromIdx];
  const toToken = BASE_TOKENS[toIdx];

  const { quote, isLoading: quoteLoading, error: quoteError } = useParaswapQuote({
    fromToken,
    toToken,
    amount,
    userAddress: address,
  });

  const { data: ethBalance } = useBalance({ address, chainId: base.id });

  const shouldReadFromTokenBalance = Boolean(fromToken.address && address);
  const { data: fromTokenBalance } = useReadContract({
    address: (fromToken.address ?? BASE_TOKENS[1].address!) as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [(address ?? ZERO_ADDRESS) as `0x${string}`],
    chainId: base.id,
    query: { enabled: shouldReadFromTokenBalance },
  });

  const shouldReadAllowance = Boolean(fromToken.address && address && quote?.spender);
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: (fromToken.address ?? BASE_TOKENS[1].address!) as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [
      (address ?? ZERO_ADDRESS) as `0x${string}`,
      (quote?.spender ?? ZERO_ADDRESS) as `0x${string}`,
    ],
    chainId: base.id,
    query: { enabled: shouldReadAllowance },
  });

  const {
    sendTransactionAsync,
    isPending: isWalletPromptOpen,
    error: sendError,
    reset: resetSendTransaction,
  } = useSendTransaction();

  const approvalReceipt = useWaitForTransactionReceipt({ hash: approvalHash });
  const swapReceipt = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (approvalReceipt.isSuccess) {
      setTxStatus("idle");
      setSwapError(null);
      void refetchAllowance();
    }

    if (approvalReceipt.isError) {
      setTxStatus("error");
      setSwapError("Approval transaction failed.");
    }
  }, [approvalReceipt.isError, approvalReceipt.isSuccess, refetchAllowance]);

  useEffect(() => {
    if (swapReceipt.isSuccess) {
      setTxStatus("success");
      setSwapError(null);
    }

    if (swapReceipt.isError) {
      setTxStatus("error");
      setSwapError("Swap transaction failed.");
    }
  }, [swapReceipt.isError, swapReceipt.isSuccess]);

  const fromBalance = !fromToken.address
    ? (ethBalance ? formatUnits(ethBalance.value, ethBalance.decimals) : "0")
    : (fromTokenBalance ? formatUnits(fromTokenBalance as bigint, fromToken.decimals) : "0");

  const formattedFromBalance = formatDisplayAmount(fromBalance);
  const expectedOut = quote ? formatDisplayAmount(formatUnits(quote.destAmount, toToken.decimals)) : "0.0";

  const allowance = (allowanceRaw as bigint | undefined) ?? 0n;
  const requiredSellAmount = quote?.srcAmount ?? 0n;

  const needsApproval = Boolean(
    fromToken.address &&
    quote?.spender &&
    requiredSellAmount > 0n &&
    allowance < requiredSellAmount,
  );

  const isSameToken = fromToken.symbol === toToken.symbol;
  const hasValidInput = Number(amount) > 0 && !Number.isNaN(Number(amount));

  const busy = useMemo(
    () =>
      isSwitchingChain ||
      isWalletPromptOpen ||
      approvalReceipt.isLoading ||
      swapReceipt.isLoading,
    [isSwitchingChain, isWalletPromptOpen, approvalReceipt.isLoading, swapReceipt.isLoading],
  );

  const ensureBaseNetwork = async () => {
    if (chainId === BASE_CHAIN_ID) return;
    await switchChainAsync({ chainId: BASE_CHAIN_ID });
  };

  const handleFlip = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    setAmount("");
    setTxStatus("idle");
    setSwapError(null);
    resetSendTransaction();
  };

  const handleApprove = async () => {
    if (!isConnected || !fromToken.address || !quote?.spender || requiredSellAmount <= 0n) return;

    setTxStatus("approving");
    setSwapError(null);

    try {
      await ensureBaseNetwork();

      const hash = await sendTransactionAsync({
        to: fromToken.address,
        value: 0n,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [quote.spender, requiredSellAmount],
        }),
        chainId: BASE_CHAIN_ID,
      });

      setApprovalHash(hash);
    } catch (error) {
      setTxStatus("error");
      setSwapError(error instanceof Error ? error.message : "Approval failed.");
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !address || !quote || !hasValidInput || isSameToken) return;

    setTxStatus("swapping");
    setSwapError(null);

    try {
      await ensureBaseNetwork();

      const srcToken = fromToken.address ?? PARASWAP_NATIVE_TOKEN;
      const destToken = toToken.address ?? PARASWAP_NATIVE_TOKEN;

      const response = await fetch(`https://apiv5.paraswap.io/transactions/${BASE_CHAIN_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          srcToken,
          destToken,
          srcAmount: quote.srcAmount.toString(),
          userAddress: address,
          priceRoute: quote.priceRoute,
          srcDecimals: fromToken.decimals,
          destDecimals: toToken.decimals,
          slippage: 100,
          partner: "anon",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          (payload as { error?: string; message?: string }).error
            ?? (payload as { error?: string; message?: string }).message
            ?? "Failed to build swap transaction.",
        );
      }

      const transaction = payload as ParaswapTransaction;
      if (!transaction.to || !transaction.data) {
        throw new Error("Invalid swap transaction payload.");
      }

      const hash = await sendTransactionAsync({
        to: transaction.to,
        data: transaction.data,
        value: BigInt(transaction.value ?? "0"),
        chainId: BASE_CHAIN_ID,
        gas: transaction.gas ? BigInt(transaction.gas) : undefined,
        gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
      });

      setSwapHash(hash);
    } catch (error) {
      setTxStatus("error");
      setSwapError(error instanceof Error ? error.message : "Swap failed.");
    }
  };

  const actionDisabled =
    !isConnected ||
    !hasValidInput ||
    isSameToken ||
    Boolean(quoteError) ||
    quoteLoading ||
    busy;

  const actionLabel = (() => {
    if (!isConnected) return "Connect Wallet";
    if (isSwitchingChain) return "Switching to Base...";
    if (quoteLoading) return "Fetching quote...";
    if (approvalReceipt.isLoading || txStatus === "approving") return `Approving ${fromToken.symbol}...`;
    if (swapReceipt.isLoading || txStatus === "swapping") return "Confirming swap...";
    if (needsApproval) return `Approve ${fromToken.symbol}`;
    return `Swap ${fromToken.symbol} → ${toToken.symbol}`;
  })();

  const onAction = () => {
    if (needsApproval) {
      void handleApprove();
      return;
    }

    void handleSwap();
  };

  return (
    <div className="min-h-svh bg-background flex">
      <DashboardSidebar />
      <main className="mt-14 md:mt-0 md:ml-[240px] flex-1 flex items-start justify-center px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Swap</h2>
            <p className="text-sm text-muted-foreground mb-8">Swap tokens on Base mainnet.</p>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-xs text-muted-foreground">
                    Balance: {formattedFromBalance} {fromToken.symbol}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setTxStatus("idle");
                      setSwapError(null);
                      resetSendTransaction();
                    }}
                    className="flex-1 bg-transparent text-2xl font-mono-nums text-foreground outline-none placeholder:text-muted-foreground"
                  />

                  <Select
                    value={String(fromIdx)}
                    onValueChange={(value) => {
                      setFromIdx(Number(value));
                      setTxStatus("idle");
                      setSwapError(null);
                    }}
                  >
                    <SelectTrigger className="w-[120px] bg-accent border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASE_TOKENS.map((token, index) => (
                        <SelectItem key={token.symbol} value={String(index)} disabled={index === toIdx}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={() => setAmount(fromBalance)}
                  className="text-xs text-primary mt-1 hover:underline cursor-pointer"
                >
                  Max
                </button>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <motion.button
                  whileTap={{ rotate: 180, scale: 0.9 }}
                  onClick={handleFlip}
                  className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors"
                >
                  <ArrowDownUp className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </motion.button>
              </div>

              <div className="bg-secondary rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">To</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex-1 text-2xl font-mono-nums text-muted-foreground">
                    {quoteLoading ? "…" : expectedOut}
                  </span>

                  <Select
                    value={String(toIdx)}
                    onValueChange={(value) => {
                      setToIdx(Number(value));
                      setTxStatus("idle");
                      setSwapError(null);
                    }}
                  >
                    <SelectTrigger className="w-[120px] bg-accent border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASE_TOKENS.map((token, index) => (
                        <SelectItem key={token.symbol} value={String(index)} disabled={index === fromIdx}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 px-1">
                <div className="flex justify-between">
                  <span>Pair</span>
                  <span className="font-mono-nums">{fromToken.symbol} → {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route</span>
                  <span>ParaSwap Aggregator</span>
                </div>
                <div className="flex justify-between">
                  <span>Network</span>
                  <span>Base Mainnet</span>
                </div>
                {needsApproval && (
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span>Approval required</span>
                  </div>
                )}
              </div>

              {quoteError && hasValidInput && !isSameToken && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {quoteError}
                </div>
              )}

              {txStatus === "success" && swapHash && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success flex items-center gap-2">
                  ✓ Swap successful!
                  <a
                    href={`https://basescan.org/tx/${swapHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-auto"
                  >
                    View tx
                  </a>
                </div>
              )}

              {(txStatus === "error" || sendError || swapError) && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {swapError ?? sendError?.message ?? "Transaction failed. Try again."}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onAction}
                disabled={actionDisabled}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                           hover:shadow-primary-glow transition-shadow"
              >
                {busy || quoteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {actionLabel}
                  </span>
                ) : actionLabel}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SwapPage;
