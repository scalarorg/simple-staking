import "dotenv/config";
import { hexToBytes } from "viem";
import { z } from "zod";

const ProjectENVSchema = z.object({
  NEXT_PUBLIC_MEMPOOL_API: z.string().min(10),
  NEXT_PUBLIC_API_URL: z.string().min(10),
  NEXT_PUBLIC_SCALAR_SCANNER: z.string().min(10),

  NEXT_PUBLIC_VERSION: z.number().default(0),
  NEXT_PUBLIC_TAG: z.string(),
  NEXT_PUBLIC_COVENANT_QUORUM: z.number().min(1).default(1),
  NEXT_PUBLIC_COVENANT_PUBKEYS: z
    .array(z.string().min(1))
    .default([
      "0248e69acb0b837fd7b94b0d6f07b9ff00e83439564ee0bdf940da12010c937501",
    ]),
  NEXT_PUBLIC_SERVICE_TAG: z.string().default("pools"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .default("https://btc-staking.testnet.scalar.org"),
  NEXT_PUBLIC_SCALAR_API_URL: z.string().default("http://localhost:1317"),
});

/**
 * Return system ENV with parsed values
 */
export const ProjectENV = ProjectENVSchema.parse({
  NEXT_PUBLIC_MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SCALAR_SCANNER: process.env.NEXT_PUBLIC_SCALAR_SCANNER,

  NEXT_PUBLIC_TAG: process.env.NEXT_PUBLIC_TAG,
  NEXT_PUBLIC_VERSION: isNaN(Number(process.env.NEXT_PUBLIC_VERSION))
    ? 0
    : Number(process.env.NEXT_PUBLIC_VERSION),

  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SCALAR_API_URL: process.env.NEXT_PUBLIC_SCALAR_API_URL,
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
