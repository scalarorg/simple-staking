import { useReadContract } from "wagmi";

import SBTC_ABI from "@/abis/sbtc";
import { DApp } from "@/app/types/dApps";

interface UseSBTCAllowanceProps {
  dApp: DApp | undefined | null;
  userAddress?: `0x${string}`;
}

export function useSBTCAllowance({ dApp, userAddress }: UseSBTCAllowanceProps) {
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: dApp?.tokenContractAddress as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "allowance",
    args: [userAddress, dApp?.scAddress as `0x${string}`],
    query: {
      enabled: !!dApp && !!userAddress,
    },
  });

  return {
    allowance,
    refetchAllowance,
  };
}
