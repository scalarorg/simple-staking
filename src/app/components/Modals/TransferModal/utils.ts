import { ProtocolChain } from "@/app/types/protocol";

export const MOCK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000123";

export const isEvmChain: (chain: ProtocolChain | null) => boolean = (chain) => {
  if (!chain) return false;
  return chain.chain_type.startsWith("evm");
};

export const isBtcChain: (chain: ProtocolChain | null) => boolean = (chain) => {
  if (!chain) return false;
  return chain.chain_type.startsWith("bitcoin");
};
