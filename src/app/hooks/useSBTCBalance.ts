import { useReadContract } from "wagmi";

import SBTC_ABI from "@/abis/sbtc";

interface UseSBTCBalanceProps {
  contractAddress?: `0x${string}`; // bond?.destinationSmartContractAddress
  userAddress?: `0x${string}`;
}

export function useSBTCBalance({
  contractAddress,
  userAddress,
}: UseSBTCBalanceProps) {
  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: SBTC_ABI,
    functionName: "balanceOf",
    args: [userAddress],
    query: {
      enabled: !!contractAddress && !!userAddress,
    },
  });

  return balance;
}
