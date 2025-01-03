import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { IGateway_ABI } from "@/abis/IGateway";

interface UseGatewayProps {
  contractAddress: `0x${string}`;
}

interface SendTokenParams {
  destinationChain: string;
  destinationAddress: string;
  symbol: string;
  amount: bigint;
}

export const useGateway = ({ contractAddress }: UseGatewayProps) => {
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
  }: SendTokenParams) => {
    writeContract({
      address: contractAddress,
      abi: IGateway_ABI,
      functionName: "sendToken",
      args: [destinationChain, destinationAddress, symbol, amount],
    });
  };

  return { hash, error, isPending, sendToken, isConfirming, isConfirmed };
};
