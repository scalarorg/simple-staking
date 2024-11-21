import { useEthersSigner } from "@/utils/ethers";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { useReadContract } from "wagmi";

// export functi, useStateon useSBTCContract(address) {
//   const signer = useEthersSigner();
//   const [loading, setLoading] = useState(false);

//   const contract =  useMemo(() => {
//     if (!address) {
//       return null;
//     }
//     return new ethers.Contract(
//       address as `0x${string}`,
//       SBTC_ABI,
//       signer,
//     );
//   }, [dApp, signer]);
// }

// export function useProtocolContract(address) {
//   const signer = useEthersSigner();

//   return useMemo(() => {
//     if (!dApp) {
//       return null;
//     }
//     return new ethers.Contract(
//       dApp?.scAddress as `0x${string}`,
//       PROTOCOL_ABI,
//       signer,
//     );
//   }, [dApp, signer]);
// }

const Contracts: Record<string, ethers.Contract> = {};

export const useContract = (address: `0x${string}`, abi: any) => {
  const signer = useEthersSigner();
  return useMemo(() => {
    if (Contracts[address]) {
      return Contracts[address];
    }
    const contract = new ethers.Contract(address, abi, signer);
    Contracts[address] = contract;
    return contract;
  }, [address, signer]);
};

export const useERC20Contract = (address: `0x${string}`) => {
  const contract = useContract(address, ERC20_ABI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [userAddress, address as `0x${string}`],
  });

  const approve = useCallback(
    async (userAddress: `0x${string}`) => {
      try {
        setLoading(true);
        await contract.approve(userAddress, address);
        await allowance.wait();
        refetchAllowance();
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    },
    [contract],
  );

  return {
    contract,
    allowance,
    refetchAllowance,
    approve,
    loading,
    error,
  };
};
