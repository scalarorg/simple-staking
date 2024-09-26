export const convertToHexOfChainId = (chainId: string): string => {
  const chainIdHex = Number(chainId).toString(16);
  return chainIdHex.length % 2 ? "0" + chainIdHex : chainIdHex;
};
