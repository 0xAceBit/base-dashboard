import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Loader2, AlertCircle } from "lucide-react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, parseUnits, encodeFunctionData, formatUnits } from "viem";
import { base } from "wagmi/chains";
import DashboardSidebar from "@/components/DashboardSidebar";
import { BASE_TOKENS, ERC20_ABI, WETH_ABI, type Token } from "@/lib/tokens";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SwapPage = () => {
  const { address, isConnected } = useAccount();
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const fromToken = BASE_TOKENS[fromIdx];
  const toToken = BASE_TOKENS[toIdx];

  const { data: ethBalance } = useBalance({ address, chainId: base.id });
  const { data: fromTokenBalance } = useReadContract({
    address: fromToken.address!,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!fromToken.address && !!address },
  });

  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) setTxStatus("success");
    if (isError) setTxStatus("error");
  }, [isSuccess, isError]);

  const handleFlip = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    setAmount("");
    setTxStatus("idle");
  };

  const isWrapUnwrap =
    (fromToken.symbol === "ETH" && toToken.symbol === "WETH") ||
    (fromToken.symbol === "WETH" && toToken.symbol === "ETH");

  const handleSwap = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setTxStatus("pending");

    const wethAddress = BASE_TOKENS.find((t) => t.symbol === "WETH")!.address!;

    if (fromToken.symbol === "ETH" && toToken.symbol === "WETH") {
      sendTransaction({
        to: wethAddress,
        value: parseEther(amount),
        data: encodeFunctionData({ abi: WETH_ABI, functionName: "deposit" }),
        chainId: base.id,
      });
    } else if (fromToken.symbol === "WETH" && toToken.symbol === "ETH") {
      sendTransaction({
        to: wethAddress,
        value: 0n,
        data: encodeFunctionData({
          abi: WETH_ABI,
          functionName: "withdraw",
          args: [parseUnits(amount, 18)],
        }),
        chainId: base.id,
      });
    } else {
      // For non wrap/unwrap pairs, show unsupported for now
      setTxStatus("error");
    }
  };

  const fromBalance = !fromToken.address
    ? (ethBalance ? formatUnits(ethBalance.value, ethBalance.decimals) : "0")
    : (fromTokenBalance ? formatUnits(fromTokenBalance as bigint, fromToken.decimals) : "0");
  const formattedBalance = parseFloat(fromBalance).toFixed(6);

  const canSwap = isWrapUnwrap && isConnected && !!amount && parseFloat(amount) > 0 && !isPending;

  return (
    <div className="min-h-svh bg-background flex">
      <DashboardSidebar />
      <main className="ml-[240px] flex-1 flex items-start justify-center px-8 py-12">
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Swap</h2>
            <p className="text-sm text-muted-foreground mb-8">Swap tokens on Base mainnet.</p>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              {/* From */}
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-xs text-muted-foreground">
                    Balance: {formattedBalance} {fromToken.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setTxStatus("idle"); }}
                    className="flex-1 bg-transparent text-2xl font-mono-nums text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <Select value={String(fromIdx)} onValueChange={(v) => { setFromIdx(Number(v)); setTxStatus("idle"); }}>
                    <SelectTrigger className="w-[120px] bg-accent border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASE_TOKENS.map((t, i) => (
                        <SelectItem key={t.symbol} value={String(i)} disabled={i === toIdx}>
                          {t.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => setAmount(formattedBalance)}
                  className="text-xs text-primary mt-1 hover:underline cursor-pointer"
                >
                  Max
                </button>
              </div>

              {/* Flip */}
              <div className="flex justify-center -my-2 relative z-10">
                <motion.button
                  whileTap={{ rotate: 180, scale: 0.9 }}
                  onClick={handleFlip}
                  className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors"
                >
                  <ArrowDownUp className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* To */}
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">To</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-2xl font-mono-nums text-muted-foreground">
                    {isWrapUnwrap ? (amount || "0.0") : "—"}
                  </span>
                  <Select value={String(toIdx)} onValueChange={(v) => { setToIdx(Number(v)); setTxStatus("idle"); }}>
                    <SelectTrigger className="w-[120px] bg-accent border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASE_TOKENS.map((t, i) => (
                        <SelectItem key={t.symbol} value={String(i)} disabled={i === fromIdx}>
                          {t.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground space-y-1 px-1">
                <div className="flex justify-between">
                  <span>Pair</span>
                  <span className="font-mono-nums">{fromToken.symbol} → {toToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span>{isWrapUnwrap ? "Wrap / Unwrap" : "DEX swap (coming soon)"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network</span>
                  <span>Base Mainnet</span>
                </div>
              </div>

              {!isWrapUnwrap && (
                <div className="bg-accent/50 border border-border rounded-lg p-3 text-xs text-muted-foreground">
                  DEX swaps for {fromToken.symbol} → {toToken.symbol} coming soon. Currently only ETH ↔ WETH wrapping is supported on-chain.
                </div>
              )}

              {txStatus === "success" && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success flex items-center gap-2">
                  ✓ Swap successful!
                  {txHash && (
                    <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline ml-auto">
                      View tx
                    </a>
                  )}
                </div>
              )}
              {txStatus === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {isWrapUnwrap ? "Transaction failed. Try again." : "This pair isn't supported yet."}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSwap}
                disabled={!canSwap}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                           hover:shadow-primary-glow transition-shadow"
              >
                {!isConnected ? "Connect Wallet" : isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming...
                  </span>
                ) : `Swap ${fromToken.symbol} → ${toToken.symbol}`}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SwapPage;
