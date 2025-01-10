import { decodeScalarBytesToUint8Array } from "@/utils/scalar/decode";

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

export const prepareCustodianPubkeys = (
  custodians: {
    name?: string;
    btc_pubkey?: string;
    status: "STATUS_UNSPECIFIED" | "STATUS_ACTIVATED" | "STATUS_DEACTIVATED";
    description?: string;
  }[],
) => {
  if (!custodians) return null;
  const custodian = custodians.filter(
    (custodian) => custodian.status === "STATUS_ACTIVATED",
  );
  return custodian
    .filter((custodian) => !!custodian.btc_pubkey)
    .map((custodian) => decodeScalarBytesToUint8Array(custodian.btc_pubkey!));
};
