import { ProtocolChain } from "@/app/types/protocol";

export const MOCK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000123";
export const GATEWAY_CONTRACT_ADDRESS =
  "0x18B625B800AB4D641e68Ade0aa5Fb61a85Fe923B";

export const isEvmChain = (chain: ProtocolChain | null) => {
  if (!chain) return false;
  return chain.chain_type.startsWith("evm");
};

export const isBtcChain = (chain: ProtocolChain | null) => {
  if (!chain) return false;
  return chain.chain_type.startsWith("btc");
};
