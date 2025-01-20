import { ethers } from "ethers";
import { useMemo } from "react";
import { Abi } from "viem";
import { useChainId } from "wagmi";

import { useEthersSigner } from "@/utils/ethers";

const Contracts: Record<string, ethers.Contract> = {};

export const useContract = (abi: Abi, address?: string) => {
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });

  return useMemo(() => {
    if (!address || !abi || !signer) return null;
    const key = `${address}-${chainId}`;
    if (Contracts[key]) {
      return Contracts[key];
    }
    const contract = new ethers.Contract(
      address as `0x${string}`,
      abi as any,
      signer,
    );
    Contracts[key] = contract;
    return contract;
  }, [address, abi, signer, chainId]);
};
