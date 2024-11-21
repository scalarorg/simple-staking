import PROTOCOL_ABI from "@/abis/protocol";
import SBTC_ABI from "@/abis/sbtc";
import { useEthersSigner } from "@/utils/ethers";
import { ethers } from "ethers";
import { useCallback, useMemo, useState } from "react";
import { useReadContract } from "wagmi";

const MOCK_ZERO_BYTES = "0x0000000000000000000000000000000000000000";

// export function useSBTCContract(tokenContractAddress: string) {
//   const signer = useEthersSigner();

//   return useMemo(() => {
//     if (!tokenContractAddress) {
//       return null;
//     }
//     return new ethers.Contract(
//       tokenContractAddress as `0x${string}`,
//       SBTC_ABI,
//       signer,
//     );
//   }, [tokenContractAddress, signer]);
// }

// export function useProtocolContract(scAddress: string) {
//   const signer = useEthersSigner();

//   return useMemo(() => {
//     if (!scAddress) {
//       return null;
//     }
//     return new ethers.Contract(
//       scAddress as `0x${string}`,
//       PROTOCOL_ABI,
//       signer,
//     );
//   }, [scAddress, signer]);
// }

const Contracts: Record<string, ethers.Contract> = {};

export const useContract = (address: string, abi: any) => {
  const signer = useEthersSigner();
  return useMemo(() => {
    if (Contracts[address]) {
      return Contracts[address];
    }
    const contract = new ethers.Contract(address as `0x${string}`, abi, signer);
    Contracts[address] = contract;
    return contract;
  }, [address, signer]);
};

export const useERC20Contract = (
  tokenContractAddress: string,
  scAddress: string,
  userEthAddress: string,
) => {
  const sBTC = useContract(tokenContractAddress, SBTC_ABI);
  const protocol = useContract(scAddress, PROTOCOL_ABI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------
  const { data: sbtcBalance } = useReadContract({
    address: scAddress as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "balanceOf",
    args: [userEthAddress],
    query: {
      enabled: !!userEthAddress,
    },
  });

  // -------------
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenContractAddress as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "allowance",
    args: [userEthAddress, scAddress as `0x${string}`],
    query: {
      enabled: !!tokenContractAddress && !!scAddress && !!userEthAddress,
    },
  });

  const approve = useCallback(
    async (burnAmount: bigint) => {
      try {
        setLoading(true);
        const txApprove = await sBTC.approve(scAddress, burnAmount);
        await txApprove.wait();
        await refetchAllowance();
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    },
    [sBTC],
  );

  // -------------
  const unstake = useCallback(
    async (chainID: string, burnAmount: bigint, psbt: string) => {
      try {
        setLoading(true);
        const txBurn = await protocol.unstake(
          chainID, // destination chain of the unbond = source chain of the bond
          MOCK_ZERO_BYTES,
          burnAmount,
          psbt,
        );
        await txBurn.wait();
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    },
    [protocol],
  );

  return {
    sBTC,
    protocol,
    sbtcBalance,
    allowance,
    refetchAllowance,
    approve,
    unstake,
    loading,
    error,
  };
};
