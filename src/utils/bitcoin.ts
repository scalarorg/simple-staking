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
  if (!address || address.length < 4) {
    throw new Error("Invalid address");
  }

  // Define network prefixes
  const networkPrefixMap: { [prefix: string]: Network } = {
    bc1q: networks.bitcoin, // Mainnet
    bc1p: networks.bitcoin, // Taproot
    tb1q: networks.testnet, // Testnet Native SegWit (P2WPKH)
    tb1p: networks.testnet, // Testnet Taproot
    bcrt1q: networks.regtest, // Regtest
    bcrt1p: networks.regtest, // Regtest Taproot
  };

  for (const prefix in networkPrefixMap) {
    if (address.startsWith(prefix)) {
      return networkPrefixMap[prefix];
    }
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
