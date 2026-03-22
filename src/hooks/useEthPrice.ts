import { useState, useEffect } from "react";

export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        setPrice(data.ethereum.usd);
      } catch (e) {
        console.error("Failed to fetch ETH price:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return { price, isLoading };
}
