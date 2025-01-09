export const MOCK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000123";

export const isEvmChain: (chain?: TProtocolChain | string) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("evm");
  return !!chain.chain?.startsWith("evm");
};

export const isBtcChain: (chain?: TProtocolChain | string) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("bitcoin");
  return !!chain.chain?.startsWith("bitcoin");
};

export const getChainID = (chain: TProtocolChain | string | null) => {
  if (!chain) return "";
  if (typeof chain === "string") return chain.split("|")[1];
  return chain.chain?.split("|")[1] || "";
};
