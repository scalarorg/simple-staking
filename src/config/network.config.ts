import { parseENV } from "@/env";
import { Network } from "@/utils/wallet/wallet_provider";

interface NetworkConfig {
  coinName: string;
  coinSymbol: string;
  networkName: string;
  mempoolApiUrl: string;
  network: Network;
}

export const getBtcNetworkType = (btcNetworkName?: string): Network => {
  const ProjectENV = parseENV(btcNetworkName);
  return (ProjectENV.NEXT_PUBLIC_NETWORK as Network) || Network.REGTEST;
};

export function getNetworkConfig(btcNetworkName?: string): NetworkConfig {
  const ProjectENV = parseENV(btcNetworkName);
  const mainnetConfig: NetworkConfig = {
    coinName: "BTC",
    coinSymbol: "BTC",
    networkName: "BTC",
    mempoolApiUrl: `${ProjectENV.NEXT_PUBLIC_MEMPOOL_API}`,
    network: Network.MAINNET,
  };
  const signetConfig: NetworkConfig = {
    coinName: "Signet BTC",
    coinSymbol: "sBTC",
    networkName: "BTC signet",
    mempoolApiUrl: `${ProjectENV.NEXT_PUBLIC_MEMPOOL_API}/signet`,
    network: Network.SIGNET,
  };
  const testnetConfig: NetworkConfig = {
    coinName: "Testnet BTC",
    coinSymbol: "tBTC",
    networkName: "BTC testnet",
    mempoolApiUrl: `${ProjectENV.NEXT_PUBLIC_MEMPOOL_API}/testnet`,
    network: Network.TESTNET,
  };
  const regtestConfig: NetworkConfig = {
    coinName: "Regtest BTC",
    coinSymbol: "rBTC",
    networkName: "BTC regtest",
    mempoolApiUrl: `${ProjectENV.NEXT_PUBLIC_MEMPOOL_API}`,
    network: Network.REGTEST,
  };
  const config: Record<string, NetworkConfig> = {
    mainnet: mainnetConfig,
    signet: signetConfig,
    testnet: testnetConfig,
    regtest: regtestConfig,
  };
  switch (getBtcNetworkType(btcNetworkName)) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.SIGNET:
      return config.signet;
    case Network.TESTNET:
      return config.testnet;
    case Network.REGTEST:
      return config.regtest;
    default:
      return config.signet;
  }
}

export function validateAddress(network: Network, address: string): void {
  if (network === Network.MAINNET && !address.startsWith("bc1")) {
    throw new Error(
      "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'.",
    );
  } else if (
    [Network.SIGNET, Network.TESTNET].includes(network) &&
    !address.startsWith("tb1")
  ) {
    throw new Error(
      "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'.",
    );
  } else if (
    ![Network.MAINNET, Network.SIGNET, Network.TESTNET].includes(network)
  ) {
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
