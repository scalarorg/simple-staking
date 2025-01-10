"use client";

import { TNetwork } from "@scalar-lab/bitcoin-vault";
import { memo, useCallback, useEffect, useState } from "react";

import { decodeScalarBytesToString } from "@/utils/scalar/decode";

import { LoadingView } from "../components/Loading";
import { useScalarnetParams } from "../hooks/useScalarnetParams";

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

export const useVault = (protocolTag?: string) => {
  if (!globalThis.scalarVaultModule) {
    throw new Error("Vault module not found");
  }

  const { data: scalarnetParams, isLoading: isLoadingScalarnetParams } =
    useScalarnetParams();
  const { network } = useNetwork();

  if (!protocolTag) {
    throw new Error("Protocol tag not found");
  }

  if (isLoadingScalarnetParams) {
    return null;
  }

  if (!scalarnetParams) {
    throw new Error("Scalarnet params not found");
  }
  if (!scalarnetParams.params?.tag) {
    throw new Error("Scalarnet params tag not found");
  }
  if (!scalarnetParams.params?.version) {
    throw new Error("Scalarnet params version not found");
  }

  const aliasedNetwork = network as TNetwork;

  // Create a unique key for each combination of parameters
  const instanceKey = `${aliasedNetwork}-${scalarnetParams.params.tag}-${scalarnetParams.params.version}-${protocolTag}`;

  if (!vaultUtilsInstances[instanceKey]) {
    vaultUtilsInstances[instanceKey] =
      globalThis.scalarVaultModule.VaultUtils.getInstance(
        decodeScalarBytesToString(scalarnetParams.params.tag),
        protocolTag,
        Number(scalarnetParams.params.version),
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
