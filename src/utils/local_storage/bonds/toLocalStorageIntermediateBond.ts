import { Bond } from "@/app/types/bonds";

export const toLocalStorageIntermediateBond = (
  id: string,
  status: string,
  simplifiedStatus: string,
  sourceChain: string,
  sourceTxHash: string,
  sourceTxHex: string,
  destinationChain: string,
  destinationSmartContractAddress: string,
  stakerPubkey: string,
  amount: string,
  createdAt: number,
  updatedAt: number,
): Bond => ({
  id,
  status,
  simplifiedStatus,
  sourceChain,
  sourceTxHash,
  sourceTxHex,
  destinationChain,
  destinationSmartContractAddress,
  stakerPubkey,
  amount,
  createdAt,
  updatedAt,
});
