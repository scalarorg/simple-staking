import { useQuery } from "@tanstack/react-query";

import { useWalletProvider } from "../context/WalletProvider";

export const useRecommendedFees = () => {
  const { mempoolClient } = useWalletProvider();
  const { data: feeRate, isLoading } = useQuery({
    queryKey: ["recommendedFees"],
    queryFn: () => mempoolClient?.fees.getFeesRecommended(),
  });

  return {
    min: feeRate?.minimumFee || 1,
    hour: feeRate?.hourFee || 1,
    fastest: feeRate?.fastestFee || 1,
    isLoading,
  };
};
