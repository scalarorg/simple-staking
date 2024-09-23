export interface Bond {
  id: string;
  status: string;
  simplifiedStatus: string;
  sourceChain: string;
  sourceTxHash: string;
  sourceTxHex: string;
  destinationChain: string;
  destinationSmartContractAddress: string;
  stakerPubkey: string;
  amount: string;
  createdAt: number;
  updatedAt: number;
}

export interface StakingTx {
  txHex: string;
  outputIndex: number;
  startTimestamp: string;
  startHeight: number;
  timelock: number;
}

export interface UnbondingTx {
  txHex: string;
  outputIndex: number;
}

export const ACTIVE = "active";
export const UNBONDING_REQUESTED = "unbonding_requested";
export const UNBONDING = "unbonding";
export const UNBONDED = "unbonded";
export const WITHDRAWN = "withdrawn";
export const PENDING = "pending";
export const OVERFLOW = "overflow";
export const EXPIRED = "expired";
export const INTERMEDIATE_UNBONDING = "intermediate_unbonding";
export const INTERMEDIATE_WITHDRAWAL = "intermediate_withdrawal";

// Define the state of a bond as per API
export const BondState = {
  ACTIVE,
  UNBONDING_REQUESTED,
  UNBONDING,
  UNBONDED,
  WITHDRAWN,
  PENDING,
  OVERFLOW,
  EXPIRED,
  INTERMEDIATE_UNBONDING,
  INTERMEDIATE_WITHDRAWAL,
};
