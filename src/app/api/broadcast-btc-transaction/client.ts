import Client from "bitcoin-core-ts";

import { ProjectENV } from "@/env";
let client: Client;
export const getClient = function () {
  if (!client) {
    client = new Client({
      network: ProjectENV.NEXT_PUBLIC_NETWORK,
      host: ProjectENV.NEXT_PUBLIC_BITCOIN_NODE_ADDRESS,
      port: ProjectENV.NEXT_PUBLIC_BITCOIN_NODE_PORT,
      wallet: ProjectENV.NEXT_PUBLIC_BITCOIN_WALLET,
      username: ProjectENV.NEXT_PUBLIC_BITCOIN_USER,
      password: ProjectENV.NEXT_PUBLIC_BITCOIN_PASSWORD,
      ssl: ProjectENV.NEXT_PUBLIC_SSL_ENABLED,
    });
  }
  return client;
};
