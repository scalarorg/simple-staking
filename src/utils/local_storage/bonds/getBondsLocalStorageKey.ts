const BONDS_KEY = "bbn-staking-bonds";

// Get the local storage key for bonds
export const getBondsLocalStorageKey = (pk: string) => {
  return pk ? `${BONDS_KEY}-${pk}` : "";
};
