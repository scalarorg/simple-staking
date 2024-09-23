const INTERMEDIAGE_BONDS_KEY = "bbn-staking-intermediate-bonds";

// Get the local storage key for bonds
export const getIntermediateBondsLocalStorageKey = (pk: string) => {
  return pk ? `${INTERMEDIAGE_BONDS_KEY}-${pk}` : "";
};
