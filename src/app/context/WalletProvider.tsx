import { networks } from "bitcoinjs-lib";
import { createContext, memo, useCallback, useContext, useState } from "react";

import { isSupportedAddressType, toNetwork } from "@/utils/wallet";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";
import { WalletProvider as TWalletProvider } from "@/utils/wallet/wallet_provider";

import { ErrorState } from "../types/errors";

import { useError } from "./Error/ErrorContext";
import { useNetwork } from "./NetworkProvicer";

export const useWalletProvider = () => {
  const ctx = useContext(WalletProviderContext);
  if (!ctx) {
    throw new Error("useWalletProvider must be used within a WalletProvider");
  }
  return {
    walletProvider: ctx.walletProvider,
    networkConfig: ctx.networkConfig,
    setWalletProvider: ctx.setWalletProvider,
    connectWallet: ctx.connectWallet,
    disconnectWallet: ctx.disconnectWallet,
  };
};

export const useWalletInfo = () => {
  const ctx = useContext(WalletProviderContext);
  if (!ctx) {
    throw new Error("useWalletInfo must be used within a WalletProvider");
  }
  return ctx.walletInfo;
};

const WalletProviderContext = createContext<{
  walletInfo: {
    balance: number;
    address: string;
    pubkey: string;
    xOnlyPubkey: string;
  };
  setWalletInfo: (walletInfo: {
    balance: number;
    address: string;
    pubkey: string;
    xOnlyPubkey: string;
  }) => void;
  walletProvider?: TWalletProvider;
  setWalletProvider: (walletProvider: TWalletProvider) => void;
  networkConfig?: networks.Network;
  setNetworkConfig: (networkConfig: networks.Network) => void;
  disconnectWallet: () => void;
  connectWallet: () => void;
} | null>(null);

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletInfo, setWalletInfo] = useState({
    balance: 0,
    address: "",
    pubkey: "",
    xOnlyPubkey: "",
  });

  const [walletProvider, setWalletProvider] = useState<TWalletProvider>();
  const [networkConfig, setNetworkConfig] = useState<networks.Network>();

  const { network: globalNetwork } = useNetwork();
  const { showError } = useError();

  const connectWallet = useCallback(async () => {
    if (!walletProvider) {
      throw new Error("Wallet provider not found");
    }
    try {
      await walletProvider.connectWallet(globalNetwork);
      const address = await walletProvider.getAddress();
      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taproot",
        );
      }

      const balanceSat = await walletProvider.getBalance();
      const pubKeyHex = await walletProvider.getPublicKeyHex();
      const pubKeyBytes = Buffer.from(pubKeyHex, "hex");
      const xOnlyPubKeyBytes =
        pubKeyBytes.length === 33 ? pubKeyBytes.subarray(1, 33) : pubKeyBytes;
      const xOnlyPubKeyHex = xOnlyPubKeyBytes.toString("hex");

      setWalletInfo({
        balance: balanceSat,
        address,
        pubkey: pubKeyHex,
        xOnlyPubkey: xOnlyPubKeyHex,
      });

      setWalletProvider(walletProvider);
      setNetworkConfig(toNetwork(globalNetwork));
    } catch (error: Error | any) {
      if (
        error instanceof WalletError &&
        error.getType() === WalletErrorType.ConnectionCancelled
      ) {
        // User cancelled the connection, hence do nothing
        return;
      }
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WALLET,
          errorTime: new Date(),
        },
        retryAction: () => connectWallet(),
      });
    }
  }, [
    globalNetwork,
    showError,
    setWalletInfo,
    setWalletProvider,
    setNetworkConfig,
    walletProvider,
  ]);

  const disconnectWallet = useCallback(async () => {
    if (!walletProvider) {
      return;
    }
    setWalletProvider(undefined);
    setNetworkConfig(undefined);
    setWalletInfo({
      balance: 0,
      address: "",
      pubkey: "",
      xOnlyPubkey: "",
    });
  }, [setWalletProvider, setNetworkConfig, walletProvider]);

  return (
    <WalletProviderContext.Provider
      value={{
        walletInfo,
        setWalletInfo,
        walletProvider,
        setWalletProvider,
        networkConfig,
        setNetworkConfig,
        disconnectWallet,
        connectWallet,
      }}
    >
      {children}
    </WalletProviderContext.Provider>
  );
};

export default memo(WalletProvider);
