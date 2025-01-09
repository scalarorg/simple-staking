import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { IGateway_ABI } from "@/abis/IGateway";

interface SendTokenParams {
  destinationChain: string;
  destinationAddress: string;
  symbol: string;
  amount: bigint;
  gatewayAddress: `0x${string}`;
}

export const useSendToken = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const sendToken = ({
    destinationChain,
    destinationAddress,
    symbol,
    amount,
    gatewayAddress,
  }: SendTokenParams) => {
    writeContract({
      address: gatewayAddress,
      abi: IGateway_ABI,
      functionName: "sendToken",
      args: [destinationChain, destinationAddress, symbol, amount],
    });
  };

  return {
    hash,
    error,
    receiptError,
    isPending,
    sendToken,
    isConfirming,
    isConfirmed,
  };
};
