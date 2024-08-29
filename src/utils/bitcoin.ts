import { networks } from "bitcoinjs-lib";

export function getBtcNetwork(network?: networks.Network): string {
  switch (network) {
    case networks.bitcoin:
      return "mainnet";
    case networks.testnet:
      return "testnet";
    case networks.regtest:
      return "regtest";
    default:
      throw new Error("Unsupported network");
  }
}
