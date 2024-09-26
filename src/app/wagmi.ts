import { ChainFormatters, defineChain } from "viem";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import * as supportedChains from "wagmi/chains";
import { injected } from "wagmi/connectors";

import { ProjectENV } from "@/env";

const defaultChainNames = ProjectENV.NEXT_PUBLIC_DEFAULT_DAPP_CHAINS.split(",");

const defaultChains = defaultChainNames
  .map((k) => supportedChains[k as keyof typeof supportedChains])
  .filter((chain) => chain !== undefined) as supportedChains.Prettify<
  supportedChains.Assign<
    supportedChains.Chain<undefined>,
    supportedChains.Chain<ChainFormatters>
  >
>[];

const localChain = defineChain({
  id: 1337,
  name: "ethereum-local",
  nativeCurrency: { name: "EVMOS Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
});

const localEthereumSepoliaChain = defineChain({
  id: 11155111,
  name: "ethereum-sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 751532,
    },
    ensRegistry: { address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
    ensUniversalResolver: {
      address: "0xc8Af999e38273D658BE1b921b88A9Ddf005769cC",
      blockCreated: 5_317_080,
    },
  },
  testnet: true,
});

const defaultChainTransports = defaultChains.reduce(
  (acc, chain) => {
    acc[chain.id] = http();
    return acc;
  },
  {} as Record<number, ReturnType<typeof http>>,
);

export function getConfig() {
  return createConfig({
    chains: [localEthereumSepoliaChain, localChain, ...defaultChains],
    connectors: [injected()],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      ...defaultChainTransports,
      [localEthereumSepoliaChain.id]: http(),
      [localChain.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
