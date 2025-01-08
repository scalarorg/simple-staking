import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { IGateway_ABI } from "@/abis/IGateway";

interface SendTokenParams {
  destinationChain: string;
  destinationAddress: string;
  symbol: string;
  amount: bigint;
  gatewayAddress: `0x${string}`;
}

export const useGateway = () => {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
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

  return { hash, error, isPending, sendToken, isConfirming, isConfirmed };
};
