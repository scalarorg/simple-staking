"use client";

import { TNetwork } from "@scalar-lab/bitcoin-vault";
import { memo, useCallback, useEffect, useState } from "react";

import { ProjectENV } from "@/env";

import { LoadingView } from "../components/Loading/Loading";

import { useNetwork } from "./NetworkProvicer";

declare global {
  namespace globalThis {
    var scalarVaultModule: TVaultModule;
  }
}

type TVaultUtilsInstances = Record<
  string,
  ReturnType<TVaultModule["VaultUtils"]["getInstance"]>
>;

// let vault: ReturnType<TVaultModule["createVaultWasm"]> | null = null;
const vaultUtilsInstances: TVaultUtilsInstances = {} as TVaultUtilsInstances;

export const useVault = (
  serviceTag?: string,
  publicTag?: string,
  version?: string,
) => {
  if (!globalThis.scalarVaultModule) {
    throw new Error("Vault module not found");
  }

  const { network } = useNetwork();
  const aliasedNetwork = network as TNetwork;
  const finalServiceTag = serviceTag || ProjectENV.NEXT_PUBLIC_SERVICE_TAG;
  const finalPublicTag = publicTag || ProjectENV.NEXT_PUBLIC_TAG;
  const finalVersion = version || ProjectENV.NEXT_PUBLIC_VERSION;

  // Create a unique key for each combination of parameters
  const instanceKey = `${aliasedNetwork}-${finalServiceTag}-${finalPublicTag}-${finalVersion}`;

  if (!vaultUtilsInstances[instanceKey]) {
    vaultUtilsInstances[instanceKey] =
      globalThis.scalarVaultModule.VaultUtils.getInstance(
        finalPublicTag,
        finalServiceTag,
        Number(finalVersion),
        aliasedNetwork,
      );
  }

  return vaultUtilsInstances[instanceKey];
};

export const useScalarVaultModule = () => {
  if (!globalThis.scalarVaultModule) {
    throw new Error("Vault module not found");
  }

  return globalThis.scalarVaultModule;
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

  return <>{loading ? <LoadingView /> : children}</>;
};

export default memo(VaultProvider);
