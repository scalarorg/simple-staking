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

const displayedChainNames: Record<string, string> = {
  "bitcoin|4": "Bitcoin Testnet4",
  "evm|1": "Ethereum",
  "evm|11155111": "Sepolia",
  "evm|97": "BSC Testnet",
};

export const getDisplayedChainName = (chain: TProtocolChain | string) => {
  if (typeof chain === "string") {
    return displayedChainNames[chain] || chain;
  }
  return chain.chain ? displayedChainNames[chain.chain] || chain.chain : "";
};
