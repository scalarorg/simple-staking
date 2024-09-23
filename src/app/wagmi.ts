import { defineChain } from "viem";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

const localChain = defineChain({
  id: 1337,
  name: "EVMOS",
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

export function getConfig() {
  return createConfig({
    chains: [sepolia, localChain],
    connectors: [
      injected(),
      //   walletConnect({
      //     projectId: ProjectENV.NEXT_PUBLIC_WC_PROJECT_ID!,
      //   }),
      metaMask(),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      //   [mainnet.id]: http(),
      [sepolia.id]: http(),
      [localChain.id]: http(),
      //   [optimism.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
