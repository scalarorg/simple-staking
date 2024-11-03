"use client";

import { memo, useCallback, useEffect, useState } from "react";

import { ProjectENV } from "@/env";

declare global {
  namespace globalThis {
    var scalarVaultModule: TVaultModule;
  }
}

let vault: ReturnType<TVaultModule["createVaultWasm"]> | null = null;

export const useVault = () => {
  if (!globalThis.scalarVaultModule) {
    throw new Error("Vault module not found");
  }
  if (!vault) {
    vault = globalThis.scalarVaultModule.createVaultWasm(
      ProjectENV.NEXT_PUBLIC_TAG,
      ProjectENV.NEXT_PUBLIC_VERSION,
    );
  }
  return vault;
};

const isClientSide = typeof window !== "undefined";

const VaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);

  const init = useCallback(async () => {
    setLoading(true);
    if (isClientSide && !globalThis.scalarVaultModule) {
      const vaultModule: TVaultModule = await import(
        "@scalar-lab/bitcoin-vault"
      );
      globalThis.scalarVaultModule = vaultModule;
    }
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    init();
  }, [init]);

  return <>{loading ? <div>Loading...</div> : children}</>;
};

export default memo(VaultProvider);
