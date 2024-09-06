import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [sepolia],
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
      //   [optimism.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
