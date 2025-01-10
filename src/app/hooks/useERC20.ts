// import { useCallback, useState } from "react";
// import { useReadContract } from "wagmi";

// import { IERC20_ABI } from "@/abis/IERC20";

// import { useContract } from "./useContracts";

// export const useERC20 = (
//   tokenAddress: `0x${string}`,
//   senderAddress: `0x${string}`,
//   spenderAddress?: `0x${string}`,
// ) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const contract = useContract(IERC20_ABI, tokenAddress);
//   const {
//     data: balance,
//     isLoading: isLoadingBalance,
//     error: balanceError,
//   } = useReadContract({
//     address: tokenAddress,
//     abi: IERC20_ABI,
//     functionName: "balanceOf",
//     args: [senderAddress],
//     query: {
//       enabled: !!senderAddress && !!contract,
//     },
//   });
//   const {
//     data: allowance,
//     refetch: refetchAllowance,
//     isLoading: isLoadingAllowance,
//     error: allowanceError,
//   } = useReadContract({
//     address: tokenAddress,
//     abi: IERC20_ABI,
//     functionName: "allowance",
//     args: [senderAddress, spenderAddress!],
//     query: {
//       enabled: !!senderAddress && !!spenderAddress && !!contract,
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
//   };
// };
