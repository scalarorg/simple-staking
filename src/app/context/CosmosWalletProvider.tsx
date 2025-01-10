"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Define interface for wallet implementations
interface WalletImplementation {
  connect: () => Promise<string>;
  disconnect: () => void;
  getBalance: (address: string) => Promise<string>;
  sendTransaction: (recipient: string, amount: string) => Promise<string>;
}

// Dummy wallet implementation for development
class DummyWallet implements WalletImplementation {
  async connect() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "cosmos1dummy123...";
  }

  disconnect() {}

  async getBalance(address: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return "1000000";
  }

  async sendTransaction(recipient: string, amount: string) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return "dummy_tx_" + Math.random().toString(36).substring(7);
  }
}

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (recipient: string, amount: string) => Promise<void>;
}

const CosmosWalletContext = createContext<WalletContextType | undefined>(
  undefined,
);

export function CosmosWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet implementation
  // TODO: Replace with Keplr implementation when ready
  const wallet = useMemo(() => new DummyWallet(), []);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAddress = await wallet.connect();
      setAddress(newAddress);
      setIsConnected(true);

      const newBalance = await wallet.getBalance(newAddress);
      setBalance(newBalance);

      // Store connection state
      localStorage.setItem("walletConnected", "true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  const disconnectWallet = () => {
    wallet.disconnect();
    setAddress(null);
    setBalance("0");
    setIsConnected(false);
    setError(null);
    localStorage.removeItem("walletConnected");
  };

  const sendTransaction = async (recipient: string, amount: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const txHash = await wallet.sendTransaction(recipient, amount);
      console.log("Transaction hash:", txHash);

      // Update balance after transaction
      const newBalance = await wallet.getBalance(address);
      setBalance(newBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("walletConnected") === "true";
    if (wasConnected) {
      connectWallet().catch(console.error);
    }
  }, [connectWallet]);

  const value = {
    address,
    balance,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction,
  };

  return (
    <CosmosWalletContext.Provider value={value}>
      {children}
    </CosmosWalletContext.Provider>
  );
}

export function useCosmosWallet() {
  const context = useContext(CosmosWalletContext);
  if (context === undefined) {
    throw new Error(
      "useCosmosWallet must be used within a CosmosWalletProvider",
    );
  }
  return context;
}
