import "dotenv/config";
import { hexToBytes } from "viem";
import { z } from "zod";

const ProjectENVSchema = z.object({
  NEXT_PUBLIC_MEMPOOL_API: z.string().min(10),
  NEXT_PUBLIC_MEMPOOL_WEB: z.string().min(10),
  NEXT_PUBLIC_API_URL: z.string().min(10),
  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: z.string().min(10),
  NEXT_PUBLIC_SCALAR_SCANNER: z.string().min(10),

  NEXT_PUBLIC_VERSION: z.number().default(0),
  NEXT_PUBLIC_TAG: z.string(),
  NEXT_PUBLIC_COVENANT_QUORUM: z.number().min(1),
  NEXT_PUBLIC_COVENANT_PUBKEYS: z.array(z.string().min(5)).optional(),
  NEXT_PUBLIC_SERVICE_TAG: z.string().default("pools"),
  NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS: z.string().default(""),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .default("https://btc-staking.testnet.scalar.org"),
  NEXT_PUBLIC_SCALAR_NODE_URL: z.string().default("http://localhost:26656"),
});

/**
 * Return system ENV with parsed values
 */
export const ProjectENV = ProjectENVSchema.parse({
  NEXT_PUBLIC_MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API,
  NEXT_PUBLIC_MEMPOOL_WEB: process.env.NEXT_PUBLIC_MEMPOOL_WEB,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: process.env.NEXT_PUBLIC_DEFAULT_DAPP_CHAINS,
  NEXT_PUBLIC_SCALAR_SCANNER: process.env.NEXT_PUBLIC_SCALAR_SCANNER,

  NEXT_PUBLIC_TAG: process.env.NEXT_PUBLIC_TAG,
  NEXT_PUBLIC_VERSION: isNaN(Number(process.env.NEXT_PUBLIC_VERSION))
    ? 0
    : Number(process.env.NEXT_PUBLIC_VERSION),

  NEXT_PUBLIC_COVENANT_QUORUM: isNaN(
    Number(process.env.NEXT_PUBLIC_COVENANT_QUORUM),
  )
    ? 1
    : Number(process.env.NEXT_PUBLIC_COVENANT_QUORUM),
  NEXT_PUBLIC_COVENANT_PUBKEYS:
    process.env.NEXT_PUBLIC_COVENANT_PUBKEYS &&
    process.env.NEXT_PUBLIC_COVENANT_PUBKEYS.split(",").length > 0
      ? process.env.NEXT_PUBLIC_COVENANT_PUBKEYS.split(",")
      : undefined,
  NEXT_PUBLIC_SERVICE_TAG: process.env.NEXT_PUBLIC_SERVICE_TAG,
  NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS:
    process.env.NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SCALAR_NODE_URL: process.env.NEXT_PUBLIC_SCALAR_NODE_URL,
});

export const ExtendedProjectENVSchema = z.object({
  NEXT_PUBLIC_COVENANT_PUBKEYS: z.instanceof(Uint8Array).optional(),
});

export const ExtendedProjectENV = ExtendedProjectENVSchema.parse({
  NEXT_PUBLIC_COVENANT_PUBKEYS: (() => {
    if (!ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS) return undefined;

    try {
      const numberOfCustodianPubkeys =
        ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS.length;
      const custodianPubkeysBuffer = new Uint8Array(
        33 * numberOfCustodianPubkeys,
      );

      for (let i = 0; i < numberOfCustodianPubkeys; i++) {
        custodianPubkeysBuffer.set(
          hexToBytes(`0x${ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS[i]}`),
          i * 33,
        );
      }

      return custodianPubkeysBuffer;
    } catch (error) {
      return undefined;
    }
  })(),
});
