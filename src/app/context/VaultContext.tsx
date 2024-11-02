"use client";

import { VaultWasm } from "@scalar-lab/bitcoin-wasm";
import { createContext, memo, useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { VAULT_TAG, VAULT_VERSION } from "@/config/vault";

const bitcoinVault = import("@scalar-lab/bitcoin-vault");

export const VaultContext = createContext<{
  vaultInstance: VaultWasm | null;
} | null>(null);

export const useVault = () => {
  const vault = useContext(VaultContext);
  if (!vault) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return vault;
};

const VaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [vaultInstance, setVaultInstance] = useState<VaultWasm | null>(null);

  useEffect(() => {
    bitcoinVault
      .then((m) => m.createVaultWasm(VAULT_TAG, VAULT_VERSION))
      .then(setVaultInstance);
  }, []);

  return (
    <VaultContext.Provider value={{ vaultInstance }}>
      {children}
    </VaultContext.Provider>
  );
};

const VaultProviderMemo = memo(VaultProvider);

const VaultProviderDynamic = dynamic(() => Promise.resolve(VaultProviderMemo), {
  ssr: false,
  loading: () => <div>Loading Vault...</div>,
});

export default VaultProviderDynamic;
