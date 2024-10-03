import Client from "bitcoin-core-ts";

import { parseENV } from "@/env";
let client: Client;
export const getClient = function (btcNetwork: string) {
  const ProjectENV = parseENV(btcNetwork);
  if (!client) {
    client = new Client({
      network: ProjectENV.NEXT_PUBLIC_NETWORK,
      host: ProjectENV.NEXT_PUBLIC_BTC_NODE_HOST,
      port: ProjectENV.NEXT_PUBLIC_BTC_NODE_PORT,
      wallet: ProjectENV.NEXT_PUBLIC_BTC_NODE_WALLET,
      username: ProjectENV.NEXT_PUBLIC_BTC_NODE_USER,
      password: ProjectENV.NEXT_PUBLIC_BTC_NODE_PASSWORD,
    });
  }
  return client;
};
