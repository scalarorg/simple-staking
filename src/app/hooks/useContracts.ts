import PROTOCOL_ABI from "@/abis/protocol";
import SBTC_ABI from "@/abis/sbtc";
import { DApp } from "@/app/types/dApps";
import { useEthersSigner } from "@/utils/ethers";
import { ethers } from "ethers";
import { useMemo } from "react";

export function useSBTCContract(dApp: DApp | null) {
  const signer = useEthersSigner();

  return useMemo(() => {
    if (!dApp) {
      return null;
    }
    return new ethers.Contract(
      dApp?.tokenContractAddress as `0x${string}`,
      SBTC_ABI,
      signer,
    );
  }, [dApp, signer]);
}

export function useProtocolContract(dApp: DApp | null) {
  const signer = useEthersSigner();

  return useMemo(() => {
    if (!dApp) {
      return null;
    }
    return new ethers.Contract(
      dApp?.scAddress as `0x${string}`,
      PROTOCOL_ABI,
      signer,
    );
  }, [dApp, signer]);
}
