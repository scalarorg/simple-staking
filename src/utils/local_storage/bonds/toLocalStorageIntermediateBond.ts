import { Bond } from "@/app/types/bonds";

export const toLocalStorageIntermediateBond = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValueSat: number,
  stakingTxHex: string,
  timelock: number,
  state: string,
): Bond => ({
  stakingTxHashHex,
  stakerPkHex,
  finalityProviderPkHex,
  state,
  stakingValueSat,
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
