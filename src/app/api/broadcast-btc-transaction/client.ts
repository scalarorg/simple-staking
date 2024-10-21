import Client from "bitcoin-core-ts";

import { ServerEnv } from "@/app/api";
import { ProjectENV } from "@/env";
let client: Client;
export const getClient = function () {
  if (!client) {
    client = new Client({
      network: ProjectENV.NEXT_PUBLIC_NETWORK,
      host: ServerEnv.BITCOIN_NODE_ADDRESS,
      port: ServerEnv.BITCOIN_NODE_PORT,
      wallet: ServerEnv.BITCOIN_WALLET,
      username: ServerEnv.BITCOIN_USER,
      password: ServerEnv.BITCOIN_PASSWORD,
      ssl: ServerEnv.SSL_ENABLED === "true",
    });
  }
  return client;
};
