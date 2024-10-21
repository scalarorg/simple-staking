export { getCovenantParams } from "./getParams";

import { z } from "zod";

const ServerEnvSchema = z.object({
  COVENANT_QUORUM: z.string().min(1),
  VERSION: z.string().min(1),
  TAG: z.string().min(1),
  COVENANT_PUBKEYS: z.array(z.string().min(10)).length(5),
  BITCOIN_NODE_ADDRESS: z.string().min(1),
  BITCOIN_NODE_PORT: z.string().min(1),
  SSL_ENABLED: z.string().min(1),
  BITCOIN_WALLET: z.string().min(1),
  BITCOIN_USER: z.string().min(1),
  BITCOIN_PASSWORD: z.string().min(1),
});

export const ServerEnv = ServerEnvSchema.parse({
  COVENANT_QUORUM: process.env.COVENANT_QUORUM,
  VERSION: process.env.VERSION,
  TAG: process.env.TAG,
  COVENANT_PUBKEYS: process.env.COVENANT_PUBKEYS!.split(","),
  BITCOIN_NODE_ADDRESS: process.env.BITCOIN_NODE_ADDRESS,
  BITCOIN_NODE_PORT: process.env.BITCOIN_NODE_PORT,
  SSL_ENABLED: process.env.SSL_ENABLED,
  BITCOIN_WALLET: process.env.BITCOIN_WALLET,
  BITCOIN_USER: process.env.BITCOIN_USER,
  BITCOIN_PASSWORD: process.env.BITCOIN_PASSWORD,
});
