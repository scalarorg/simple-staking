"use client";

import { createContext, memo, useContext, useState } from "react";

import { Network } from "@/utils/wallet/wallet_provider";

const NetworkProviderContext = createContext<{
  network: Network;
  setNetwork: (network: Network) => void;
} | null>(null);

export const useNetwork = () => {
  const context = useContext(NetworkProviderContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }

  return context;
};

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [network, setNetwork] = useState<Network>(Network.TESTNET4);

  return (
    <NetworkProviderContext.Provider
      value={{
        network,
        setNetwork,
      }}
    >
      {children}
    </NetworkProviderContext.Provider>
  );
};

export default memo(NetworkProvider);
