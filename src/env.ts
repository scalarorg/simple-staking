import { z } from "zod";

const ProjectENVSchema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_MEMPOOL_API: z.string().default(""),
  NEXT_PUBLIC_MEMPOOL_API2: z.string().default(""),
  NEXT_PUBLIC_MEMPOOL_WEB: z.string().default(""),
  NEXT_PUBLIC_API_URL: z.string().default(""),
  NEXT_PUBLIC_NETWORK: z.string().default("regtest"),
  NEXT_PUBLIC_STAKING_AMOUNT: z.string().default("0"),
  NEXT_PUBLIC_MINTING_AMOUNT: z.string().default("0"),
  // NEXT_PUBLIC_STAKING_DURATION: z.number().default(0),
  NEXT_PUBLIC_BURNING_AMOUNT: z.string(),
  NEXT_PUBLIC_COVENANT_QUORUM: z.string().default("0"),
  NEXT_PUBLIC_TAG: z.string().default(""),
  NEXT_PUBLIC_VERSION: z.string().default("0"),
  NEXT_PUBLIC_COVENANT_PUBKEYS: z.string().default(""),
  NEXT_PUBLIC_SERVICE_PUBKEY: z.string().default(""),
  NEXT_PUBLIC_SERVICE_PRIVATE_KEY: z.string().default(""),
  NEXT_PUBLIC_BTC_CHAIN_NAME: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_URL: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_HOST: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_PORT: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_WALLET: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_USER: z.string().default(""),
  NEXT_PUBLIC_BTC_NODE_PASSWORD: z.string().default(""),
  NEXT_PUBLIC_BTC_ADDRESS: z.string().default(""),
  NEXT_PUBLIC_BURN_CONTRACT_ADDRESS: z.string().default(""),
  NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS: z.string().default(""),

  NEXT_PUBLIC_BOND_HOLDER_ADDRESS: z.string().default(""),
  NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY: z.string().default(""),
  NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY: z.string().default(""),

  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: z.string().default(""),
});

/**
 * Return system ENV with parsed values
 */
export const ProjectENV = ProjectENVSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_MEMPOOL_API: process.env.NEXT_PUBLIC_MEMPOOL_API,
  NEXT_PUBLIC_MEMPOOL_API2: process.env.NEXT_PUBLIC_MEMPOOL_API2,
  NEXT_PUBLIC_MEMPOOL_WEB: process.env.NEXT_PUBLIC_MEMPOOL_WEB,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  NEXT_PUBLIC_STAKING_AMOUNT: process.env.NEXT_PUBLIC_STAKING_AMOUNT,
  NEXT_PUBLIC_MINTING_AMOUNT: process.env.NEXT_PUBLIC_MINTING_AMOUNT,
  // NEXT_PUBLIC_STAKING_DURATION: (
  //   process.env.NEXT_PUBLIC_STAKING_DURATION || 0,
  // ),
  NEXT_PUBLIC_BURNING_AMOUNT: process.env.NEXT_PUBLIC_BURNING_AMOUNT,
  NEXT_PUBLIC_COVENANT_QUORUM: process.env.NEXT_PUBLIC_COVENANT_QUORUM,
  NEXT_PUBLIC_TAG: process.env.NEXT_PUBLIC_TAG,
  NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
  NEXT_PUBLIC_COVENANT_PUBKEYS: process.env.NEXT_PUBLIC_COVENANT_PUBKEYS,
  NEXT_PUBLIC_SERVICE_PUBKEY: process.env.NEXT_PUBLIC_SERVICE_PUBKEY,
  NEXT_PUBLIC_SERVICE_PRIVATE_KEY: process.env.NEXT_PUBLIC_SERVICE_PRIVATE_KEY,
  NEXT_PUBLIC_BTC_CHAIN_NAME: process.env.NEXT_PUBLIC_BTC_CHAIN_NAME,
  NEXT_PUBLIC_BTC_NODE_URL: process.env.NEXT_PUBLIC_BTC_NODE_URL,
  NEXT_PUBLIC_BTC_NODE_HOST: process.env.NEXT_PUBLIC_BTC_NODE_HOST,
  NEXT_PUBLIC_BTC_NODE_PORT: process.env.NEXT_PUBLIC_BTC_NODE_PORT,
  NEXT_PUBLIC_BTC_NODE_WALLET: process.env.NEXT_PUBLIC_BTC_NODE_WALLET,
  NEXT_PUBLIC_BTC_NODE_USER: process.env.NEXT_PUBLIC_BTC_NODE_USER,
  NEXT_PUBLIC_BTC_NODE_PASSWORD: process.env.NEXT_PUBLIC_BTC_NODE_PASSWORD,
  NEXT_PUBLIC_BTC_ADDRESS: process.env.NEXT_PUBLIC_BTC_ADDRESS,
  NEXT_PUBLIC_BURN_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_BURN_CONTRACT_ADDRESS,
  NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS:
    process.env.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS,
  NEXT_PUBLIC_BOND_HOLDER_ADDRESS: process.env.NEXT_PUBLIC_BOND_HOLDER_ADDRESS,
  NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY:
    process.env.NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY,
  NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY,
  NEXT_PUBLIC_DEFAULT_DAPP_CHAINS: process.env.NEXT_PUBLIC_DEFAULT_DAPP_CHAINS,
});
