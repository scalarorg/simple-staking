"use client";

import { memo, useCallback, useEffect, useState } from "react";

import { ProjectENV } from "@/env";

import { TNetwork } from "@scalar-lab/bitcoin-vault";
import { LoadingView } from "../components/Loading/Loading";
import { useNetwork } from "./NetworkProvicer";

declare global {
  namespace globalThis {
    var scalarVaultModule: TVaultModule;
  }
}

type TVaultUtilsInstances = Record<
  TNetwork,
  ReturnType<TVaultModule["VaultUtils"]["getInstance"]>
>;

// let vault: ReturnType<TVaultModule["createVaultWasm"]> | null = null;
const vaultUtilsInstances: TVaultUtilsInstances = {} as TVaultUtilsInstances;

export const useVault = () => {
  if (!globalThis.scalarVaultModule) {
    throw new Error("Vault module not found");
  }

  const { network } = useNetwork();
  const aliasedNetwork = network as TNetwork;

  if (!vaultUtilsInstances[aliasedNetwork]) {
    vaultUtilsInstances[aliasedNetwork] =
      globalThis.scalarVaultModule.VaultUtils.getInstance(
        ProjectENV.NEXT_PUBLIC_TAG,
        ProjectENV.NEXT_PUBLIC_SERVICE_TAG,
        ProjectENV.NEXT_PUBLIC_VERSION,
        aliasedNetwork,
      );
  }

  console.log("--- public tag ---", ProjectENV.NEXT_PUBLIC_TAG);
  console.log("--- public service tag ---", ProjectENV.NEXT_PUBLIC_SERVICE_TAG);
  console.log("--- public version ---", ProjectENV.NEXT_PUBLIC_VERSION);
  console.log("--- network ---", aliasedNetwork);

  return vaultUtilsInstances[aliasedNetwork];
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
