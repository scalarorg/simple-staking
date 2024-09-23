import { Bond } from "@/app/types/bonds";

import { getTxInfo } from "../../mempool_api";

// Duration after which a bond should be removed from the local storage
// if not identified by the API or mempool.
const maxBondPendingDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Filter bonds from the local storage
// Returns the bonds that are valid and should be kept in the local storage
export const filterBondsLocalStorage = async (
  bondsLocalStorage: Bond[],
  bondsFromAPI: Bond[],
): Promise<Bond[]> => {
  const validBonds: Bond[] = [];

  // `continue` will not add the bond to the validBonds array
  for (const localBond of bondsLocalStorage) {
    // Check if the bond is already present in the API
    const bondInAPI = bondsFromAPI.find(
      (bond) => bond?.sourceTxHash === localBond?.sourceTxHash,
    );

    if (bondInAPI) {
      continue;
    }

    // Check if the bond has exceeded the max duration
    const startTimestamp = new Date(localBond.createdAt * 1000).getTime();
    const currentTime = Date.now();
    const hasExceededDuration =
      currentTime - startTimestamp > maxBondPendingDuration;

    if (hasExceededDuration) {
      // We are removing the bond from the local storage
      // only if it has exceeded the max duration and is not in the mempool
      // otherwise (low fees as example), we keep it in the local storage

      // Check if the transaction is in the mempool
      let isInMempool = true;
      try {
        const fetchedTx = await getTxInfo(localBond.sourceTxHash);
        if (!fetchedTx) {
          throw new Error("Transaction not found in the mempool");
        }
      } catch (_error) {
        isInMempool = false;
      }

      if (!isInMempool) {
        continue;
      }
    }

    validBonds.push(localBond);
  }

  return validBonds;
};
