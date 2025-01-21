import { decodeScalarBytesToUint8Array } from "@/utils/scalar/decode";
import { isHexString } from "ethers";

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

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

export const validateRequiredFields = (fields: Record<string, any>) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) throw new Error(`Missing required field: ${key}`);
  }
};

export const handleError = (error: any) => {
  console.error({ error });
  throw error instanceof Error ? error : new Error("An error occurred");
};

export const prepareCustodianPubkeysArray = (custodians: any[]) => {
  const custodianPubkeysBuffer = prepareCustodianPubkeys(custodians);
  if (!custodianPubkeysBuffer) throw new Error("Invalid custodian pubkeys");

  return new Uint8Array(
    custodianPubkeysBuffer.reduce(
      (acc: number[], curr) => [...acc, ...Array.from(curr)],
      [],
    ),
  );
};

export const validateTransferConfig = (
  sourceTokenAddress?: string,
  gateway?: { address?: string },
) => {
  if (
    !sourceTokenAddress ||
    !gateway?.address ||
    !isHexString(gateway.address)
  ) {
    throw new Error("Invalid configuration");
  }
};

export const handleTokenApproval = async (
  sourceChainAddress: string,
  gatewayAddress: `0x${string}`,
  transferAmount: bigint,
  { checkAllowance, approveERC20 }: any,
) => {
  const currentAllowance = await checkAllowance(
    sourceChainAddress,
    gatewayAddress,
  );

  if (currentAllowance < transferAmount) {
    try {
      const approvalTx = await approveERC20(gatewayAddress, transferAmount);
      if (!approvalTx) throw new Error("Failed to create approval transaction");

      const approvalConfirmed = await Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Approval timeout")), 60000),
        ),
        approvalTx.wait(),
      ]);

      if (!approvalConfirmed) {
        throw new Error("Approval failed");
      }
    } catch (error: any) {
      if (error.message?.includes("contract runner")) {
        throw new Error(
          "Please ensure your wallet is connected and network is correct",
        );
      }
      throw error;
    }
  }
};
