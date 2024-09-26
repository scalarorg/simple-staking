import { Network, networks, Transaction } from "bitcoinjs-lib";

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

export function getBTCNetworkFromAddress(address: string): string {
  const network = getAddressNetworkType(address);

  return getBtcNetwork(network);
}

export function getAddressNetworkType(address: string): Network {
  // mainnet
  if (address.startsWith("bc1q")) {
    return networks.bitcoin;
  }
  // testnet
  else if (address.startsWith("tb1q")) {
    return networks.testnet;
  }

  // regtest
  else if (address.startsWith("bcrt1q")) {
    return networks.regtest;
  }
  throw new Error(`Unknown address: ${address}`);
}

export function getBondValueStringFromStakingTxHex(
  txHex: string | undefined,
): string {
  if (!txHex) {
    return "Is coming...";
  }
  const tx = Transaction.fromHex(txHex);
  const output = tx.outs[0];
  const value = output.value;
  return value.toLocaleString();
}
