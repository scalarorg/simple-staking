export const getChainName = (chain: TProtocolChain) => {
  return chain.chain;
};

export const getChainType = (chain: TProtocolChain) => {
  return chain.chain?.split("|")[0];
};

export const getChainID = (chain: TProtocolChain) => {
  return chain.chain?.split("|")[1];
};
