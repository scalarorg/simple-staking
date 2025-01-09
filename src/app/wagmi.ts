import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { bscTestnet, sepolia } from "wagmi/chains";
export function getConfig() {
  return createConfig({
    chains: [sepolia, bscTestnet],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepolia.id]: http(),
      [bscTestnet.id]: http(),
    },
  });
}

export const isSupportedChain = (chainId: number): chainId is 11155111 | 97 => {
  return [sepolia.id, bscTestnet.id].includes(chainId as 11155111 | 97);
};
