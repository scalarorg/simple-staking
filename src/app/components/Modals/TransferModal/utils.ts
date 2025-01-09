export const MOCK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000123";

export const isEvmChain: (chain: TProtocolChain | string | null) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("evm");
  return !!chain.chain?.startsWith("evm");
};

export const isBtcChain: (chain: TProtocolChain | string | null) => boolean = (
  chain,
) => {
  if (!chain) return false;
  if (typeof chain === "string") return !!chain.startsWith("bitcoin");
  return !!chain.chain?.startsWith("bitcoin");
};
