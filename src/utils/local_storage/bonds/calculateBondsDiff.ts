import { Bond } from "@/app/types/bonds";

import { filterBondsLocalStorage } from "./filterBondsLocalStorage";

export const calculateBondsDiff = async (
  bonds: Bond[],
  bondsLocalStorage: Bond[],
): Promise<{ areBondsDifferent: boolean; bonds: Bond[] }> => {
  // Filter the bonds that are still valid
  const validBondsLocalStorage = await filterBondsLocalStorage(
    bondsLocalStorage,
    bonds,
  );

  // Extract the stakingTxHashHex
  const validBondsHashes = validBondsLocalStorage
    .map((bond) => bond.sourceTxHash)
    .sort();
  const bondsLocalStorageHashes = bondsLocalStorage
    .map((bond) => bond.sourceTxHash)
    .sort();

  // Check if the validBonds are different from the current bondsLocalStorage
  const areBondsDifferent =
    validBondsHashes.length !== bondsLocalStorageHashes.length ||
    validBondsHashes.some(
      (hash, index) => hash !== bondsLocalStorageHashes[index],
    );

  return {
    areBondsDifferent,
    bonds: validBondsLocalStorage,
  };
};
