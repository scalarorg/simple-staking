import { Bond, BondState } from "@/app/types/bonds";

export const toLocalStorageBond = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValueSat: number,
  stakingTxHex: string,
  timelock: number,
): Bond => ({
  stakingTxHashHex: stakingTxHashHex,
  stakerPkHex: stakerPkHex,
  finalityProviderPkHex: finalityProviderPkHex,
  state: BondState.PENDING,
  stakingValueSat: stakingValueSat,
  stakingTx: {
    txHex: stakingTxHex,
    outputIndex: 0,
    startTimestamp: new Date().toISOString(),
    startHeight: 0,
    timelock,
  },
  isOverflow: false,
  unbondingTx: undefined,
});
