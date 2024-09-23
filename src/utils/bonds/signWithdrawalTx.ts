import { Transaction, networks } from "bitcoinjs-lib";
import {
  PsbtTransactionResult,
  withdrawEarlyUnbondedTransaction,
  withdrawTimelockUnbondedTransaction,
} from "btc-staking-ts";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { SignPsbtTransaction } from "@/app/common/utils/psbt";
import { Bond as BondInterface } from "@/app/types/bonds";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";

// Sign a withdrawal transaction
// Returns:
// - withdrawalTx: the signed withdrawal transaction
// - bond: the initial bond
export const signWithdrawalTx = async (
  id: string,
  bondsAPI: BondInterface[],
  globalParamsVersion: GlobalParamsVersion,
  publicKeyNoCoord: string,
  btcWalletNetwork: networks.Network,
  signPsbtTx: SignPsbtTransaction,
  address: string,
  getNetworkFees: () => Promise<{ fastestFee: number }>,
  pushTx: (txHex: string) => Promise<string>,
): Promise<{
  withdrawalTxHex: string;
  bond: BondInterface;
}> => {
  // Check if the data is available
  if (!bondsAPI || !globalParamsVersion) {
    throw new Error("No back-end API data available");
  }

  // Find the bond in the bonds retrieved from the API
  const bond = bondsAPI.find((bond) => bond.stakingTxHashHex === id);
  if (!bond) {
    throw new Error("Bond not found");
  }

  // Get the required data
  const [paramVersions, fees] = await Promise.all([
    getGlobalParams(),
    getNetworkFees(),
  ]);

  // State of global params when the staking transaction was submitted
  const { currentVersion: globalParamsWhenStaking } =
    getCurrentGlobalParamsVersion(bond.stakingTx.startHeight, paramVersions);

  if (!globalParamsWhenStaking) {
    throw new Error("Current version not found");
  }

  // Recreate the staking scripts
  const {
    timelockScript,
    slashingScript,
    unbondingScript,
    unbondingTimelockScript,
  } = apiDataToStakingScripts(
    bond.finalityProviderPkHex,
    bond.stakingTx.timelock,
    globalParamsWhenStaking,
    publicKeyNoCoord,
  );

  // Create the withdrawal transaction
  let withdrawPsbtTxResult: PsbtTransactionResult;
  if (bond?.unbondingTx) {
    // Withdraw funds from an unbonding transaction that was submitted for early unbonding and the unbonding period has passed
    withdrawPsbtTxResult = withdrawEarlyUnbondedTransaction(
      {
        unbondingTimelockScript,
        slashingScript,
      },
      Transaction.fromHex(bond.unbondingTx.txHex),
      address,
      btcWalletNetwork,
      fees.fastestFee,
      0,
    );
  } else {
    // Withdraw funds from a staking transaction in which the timelock naturally expired
    withdrawPsbtTxResult = withdrawTimelockUnbondedTransaction(
      {
        timelockScript,
        slashingScript,
        unbondingScript,
      },
      Transaction.fromHex(bond.stakingTx.txHex),
      address,
      btcWalletNetwork,
      fees.fastestFee,
      bond.stakingTx.outputIndex,
    );
  }

  // Sign the withdrawal transaction
  let withdrawalTx: Transaction;
  try {
    const { psbt } = withdrawPsbtTxResult;
    withdrawalTx = await signPsbtTx(psbt.toHex());
  } catch (error) {
    throw new Error("Failed to sign PSBT for the withdrawal transaction");
  }

  // Get the withdrawal transaction hex
  const withdrawalTxHex = withdrawalTx.toHex();

  // Broadcast withdrawal transaction
  await pushTx(withdrawalTxHex);

  return { withdrawalTxHex, bond };
};
