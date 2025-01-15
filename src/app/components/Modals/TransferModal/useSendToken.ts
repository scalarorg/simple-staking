import { useCallback, useState } from "react";

import { IGateway_ABI } from "@/abis/IGateway";
import { useContract } from "@/app/hooks/useContracts";

interface SendTokenParams {
  destinationChain: string;
  destinationAddress: string;
  symbol: string;
  amount: bigint;
}

interface CallContractWithTokenParams {
  destinationChain: string;
  destinationContractAddress: string;
  payload: string;
  symbol: string;
  amount: bigint;
}

export const useGatewayContract = (gatewayAddress: `0x${string}`) => {
  const contract = useContract(IGateway_ABI, gatewayAddress);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const sendToken = useCallback(
    async (params: SendTokenParams) => {
      if (!contract) return;
      setIsPending(true);
      try {
        return contract.sendToken?.(
          params.destinationChain,
          params.destinationAddress,
          params.symbol,
          params.amount,
        );
      } catch (error) {
        setError(error as string);
      } finally {
        setIsPending(false);
      }
    },
    [contract],
  );

  const callContractWithToken = useCallback(
    async (params: CallContractWithTokenParams) => {
      if (!contract) return;
      setIsPending(true);
      try {
        return contract.callContractWithToken?.(
          params.destinationChain,
          params.destinationContractAddress,
          params.payload,
          params.symbol,
          params.amount,
        );
      } catch (error) {
        setError(error as string);
      } finally {
        setIsPending(false);
      }
    },
    [contract],
  );

  return {
    error,
    sendToken,
    callContractWithToken,
    isPending,
  };
};
