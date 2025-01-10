import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { IGateway_ABI } from "@/abis/IGateway";

interface callContractWithTokenParams {
  destinationChain: string;
  destinationContractAddress: string;
  payload: THexString;
  symbol: string;
  amount: bigint;
  gatewayAddress: `0x${string}`;
}

export const useCallContractWithToken = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const callContractWithToken = ({
    destinationChain,
    destinationContractAddress,
    payload,
    symbol,
    amount,
    gatewayAddress,
  }: callContractWithTokenParams) => {
    writeContract({
      address: gatewayAddress,
      abi: IGateway_ABI,
      functionName: "callContractWithToken",
      args: [
        destinationChain,
        destinationContractAddress,
        payload,
        symbol,
        amount,
      ],
    });
  };

  return {
    hash,
    error,
    receiptError,
    isPending,
    callContractWithToken,
    isConfirming,
    isConfirmed,
  };
};
