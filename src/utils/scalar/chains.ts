export const getChainName = (chain: TProtocolChain) => {
  return chain.chain;
};

export const getChainType = (chain: TProtocolChain) => {
  return chain.chain?.split("|")[0];
};

export const getChainID = (chain: TProtocolChain | string | null) => {
  if (!chain) return "";
  if (typeof chain === "string") return chain.split("|")[1];
  return chain.chain?.split("|")[1] || "";
};
