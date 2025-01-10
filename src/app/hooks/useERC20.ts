import { useCallback, useState } from "react";

import { IERC20_ABI } from "@/abis/IERC20";

import { useContract } from "./useContracts";

export const useERC20 = (tokenAddress?: `0x${string}`) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contract = useContract(IERC20_ABI, tokenAddress);

  const approve = useCallback(
    async (spenderAddress: string, burnAmount: bigint) => {
      if (!contract) return;
      try {
        setLoading(true);
        const txApprove = await contract.approve?.(spenderAddress, burnAmount);
        await txApprove.wait();
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    },
    [contract],
  );

  return {
    isLoadingApprove: loading,
    approveError: error,
    approve,
  };
};
