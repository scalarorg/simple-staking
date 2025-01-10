import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { bscTestnet, sepolia } from "wagmi/chains";

const chains = [sepolia, bscTestnet] as const;
const transports = {
  [sepolia.id]: http(),
  [bscTestnet.id]: http(),
};

export function getConfig() {
  return createConfig({
    chains,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports,
  });
}

export const isSupportedChain = (
  chainId: number,
): chainId is (typeof chains)[number]["id"] => {
  return chains
    .map((chain) => chain.id)
    .includes(chainId as (typeof chains)[number]["id"]);
};

export const getWagmiChain = (chainId: number) => {
  return chains.find((chain) => chain.id === chainId);
};
