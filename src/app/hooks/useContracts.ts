import { ethers } from "ethers";
import { useMemo } from "react";
import { Abi } from "viem";

import { useEthersSigner } from "@/utils/ethers";

const Contracts: Record<string, ethers.Contract> = {};

export const useContract = (abi: Abi, address?: string) => {
  const signer = useEthersSigner();
  return useMemo(() => {
    if (!address) return null;
    if (!abi) return null;
    if (Contracts[address]) {
      return Contracts[address];
    }
    const contract = new ethers.Contract(
      address as `0x${string}`,
      abi as any,
      signer,
    );
    Contracts[address] = contract;
    return contract;
  }, [address, signer, abi]);
};
