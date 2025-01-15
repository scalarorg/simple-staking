import { useCallback, useState } from "react";

import { IERC20_ABI } from "@/abis/IERC20";

import { useContract } from "./useContracts";

export const useERC20 = (tokenAddress?: `0x${string}`) => {
  const [error, setError] = useState<string | null>(null);
  const contract = useContract(IERC20_ABI, tokenAddress);

  const approve = useCallback(
    async (spenderAddress: string, burnAmount: bigint) => {
      if (!contract) return;
      try {
        return contract.approve?.(spenderAddress, burnAmount);
      } catch (error) {
        setError(error as string);
      }
    },
    [contract],
  );

  const checkAllowance = useCallback(
    async (ownerAddress: string, spenderAddress: string) => {
      if (!contract) return;
      return contract.allowance?.(ownerAddress, spenderAddress);
    },
    [contract],
  );

  const balanceOf = useCallback(
    async (ownerAddress: string) => {
      if (!contract) return;
      return contract.balanceOf?.(ownerAddress);
    },
    [contract],
  );

  return {
    approveError: error,
    approve,
    checkAllowance,
    balanceOf,
  };
};
