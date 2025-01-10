// import { ethers } from "ethers";
// import { useCallback, useMemo, useState } from "react";
// import { Abi } from "viem";
// import { useReadContract } from "wagmi";

// import { useEthersSigner } from "@/utils/ethers";

// const MOCK_ZERO_BYTES = "0x0000000000000000000000000000000000000000";

// const Contracts: Record<string, ethers.Contract> = {};

// export const useContract = (abi: Abi, address?: string) => {
//   const signer = useEthersSigner();
//   return useMemo(() => {
//     if (!address) return null;
//     if (!abi) return null;
//     if (Contracts[address]) {
//       return Contracts[address];
//     }
//     console.log("abi, address: ", abi, address);
//     const contract = new ethers.Contract(
//       address as `0x${string}`,
//       abi as any,
//       signer,
//     );
//     Contracts[address] = contract;
//     return contract;
//   }, [address, signer, abi]);
// };

// // deprecated, remove in the future
// export const useERC20Contract = (
//   abi: any,
//   contractAddress?: string,
//   senderAddress?: string,
//   spenderAddress?: string,
// ) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const contract = useContract(abi, contractAddress);
//   const {
//     data: balance,
//     isLoading: isLoadingBalance,
//     error: balanceError,
//   } = useReadContract({
//     address: contractAddress as `0x${string}`,
//     abi: abi,
//     functionName: "balanceOf",
//     args: [senderAddress ?? MOCK_ZERO_BYTES],
//     query: {
//       enabled: !!senderAddress && !!contractAddress && !!contract,
//     },
//   });
//   const {
//     data: allowance,
//     refetch: refetchAllowance,
//     isLoading: isLoadingAllowance,
//     error: allowanceError,
//   } = useReadContract({
//     address: contractAddress as `0x${string}`,
//     abi: abi,
//     functionName: "allowance",
//     args: [senderAddress ?? MOCK_ZERO_BYTES, spenderAddress ?? MOCK_ZERO_BYTES],
//     query: {
//       enabled:
//         !!senderAddress && !!spenderAddress && !!contractAddress && !!contract,
//     },
//   });
//   const { data: tokenName } = useReadContract({
//     address: contractAddress as `0x${string}`,
//     abi: abi,
//     functionName: "name",
//     query: {
//       enabled: !!contractAddress && !!contract,
//     },
//   });
//   const { data: tokenSymbol } = useReadContract({
//     address: contractAddress as `0x${string}`,
//     abi: abi,
//     functionName: "symbol",
//     query: {
//       enabled: !!contractAddress && !!contract,
//     },
//   });

//   const approve = useCallback(
//     async (spenderAddress: string, burnAmount: bigint) => {
//       if (!contract) return;
//       try {
//         setLoading(true);
//         const txApprove = await contract.approve(spenderAddress, burnAmount);
//         await txApprove.wait();
//         await refetchAllowance();
//       } catch (error) {
//         setError(error as string);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [contract, refetchAllowance],
//   );

//   return {
//     isLoadingApprove: loading,
//     approveError: error,
//     balance,
//     isLoadingBalance,
//     balanceError,
//     allowance,
//     isLoadingAllowance,
//     allowanceError,
//     refetchAllowance,
//     approve,
//     tokenName,
//     tokenSymbol,
//   };
// };

// export const useProtocolContract = (abi: any, address?: string) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const contract = useContract(abi, address);

//   const unstake = useCallback(
//     async (chainID: string, burnAmount: bigint, psbt: string) => {
//       if (!contract) return;
//       try {
//         setLoading(true);
//         const txBurn = await contract.unstake(
//           chainID, // destination chain of the unbond = source chain of the bond
//           MOCK_ZERO_BYTES,
//           burnAmount,
//           psbt,
//         );
//         await txBurn.wait();
//       } catch (error) {
//         setError(error as string);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [contract],
//   );

//   return {
//     unstakeLoading: loading,
//     unstakeError: error,
//     unstake,
//   };
// };
