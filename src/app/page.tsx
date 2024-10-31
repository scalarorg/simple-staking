"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { initBTCCurve } from "btc-staking-ts";
import Image from "next/image";
import { useEffect, useState } from "react";

import { deleteDApp, getDApps } from "@/app/api/dApp";
import earth from "@/app/assets/earth.webp";
import stone from "@/app/assets/stone.webp";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { Network } from "@/utils/wallet/wallet_provider";

import { PaginatedBonds, getBonds } from "./api/getBonds";
import {
  PaginatedFinalityProviders,
  getFinalityProviders,
} from "./api/getFinalityProviders";
import { getGlobalParams } from "./api/getGlobalParams";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { ConnectModal } from "./components/Modals/ConnectModal";
import { Stats } from "./components/Stats/Stats";
import { Summary } from "./components/Summary/Summary";
import { toast } from "./components/ui/use-toast";
import { useError } from "./context/Error/ErrorContext";
import { useNetwork } from "./context/NetworkProvicer";
import { useTerms } from "./context/Terms/TermsContext";
import { useWalletInfo, useWalletProvider } from "./context/WalletProvider";
import { ErrorHandlerParam, ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [addDAppModalOpen, setAddDAppModalOpen] = useState(false);
  const [updateDAppModalOpen, setUpdateDAppModalOpen] = useState(false);
  const [dApp, setDApp] = useState<DAppInterface>();

  const { error, isErrorOpen, showError, hideError, retryErrorAction } =
    useError();
  const { isTermsOpen, closeTerms } = useTerms();

  const { walletProvider } = useWalletProvider();

  const { address, xOnlyPubkey, balance } = useWalletInfo();

  const {
    data: paramWithContext,
    isLoading: isLoadingCurrentParams,
    error: globalParamsVersionError,
    isError: hasGlobalParamsVersionError,
    refetch: refetchGlobalParamsVersion,
  } = useQuery({
    queryKey: ["global params"],
    queryFn: async () => {
      const [height, versions] = await Promise.all([
        walletProvider!.getBTCTipHeight(),
        getGlobalParams(),
      ]);
      return {
        // The staking parameters are retrieved based on the current height + 1
        // so this verification should take this into account.
        currentHeight: height,
        nextBlockParams: getCurrentGlobalParamsVersion(height + 1, versions),
      };
    },
    refetchInterval: 60000, // 1 minute
    // Should be enabled only when the wallet is connected
    enabled: !!walletProvider,
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: finalityProviders,
    fetchNextPage: fetchNextFinalityProvidersPage,
    hasNextPage: hasNextFinalityProvidersPage,
    isFetchingNextPage: isFetchingNextFinalityProvidersPage,
    error: finalityProvidersError,
    isError: hasFinalityProvidersError,
    refetch: refetchFinalityProvidersData,
    isRefetchError: isRefetchFinalityProvidersError,
  } = useInfiniteQuery({
    queryKey: ["finality providers"],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } },
      );
      return flattenedData;
    },
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: dApps,
    isLoading: isLoadingCurrentDApps,
    error: dAppsError,
    isError: hasDAppsError,
    refetch: refetchDApps,
  } = useQuery({
    queryKey: ["dApps"],
    queryFn: () => getDApps(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const {
    data: bonds,
    error: bondsError,
    isError: hasBondsError,
    refetch: refetchBondData,
  } = useInfiniteQuery({
    queryKey: ["bonds", address, xOnlyPubkey],
    queryFn: ({ pageParam = "" }) => getBonds(pageParam, xOnlyPubkey),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: !!(walletProvider && xOnlyPubkey && address),
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedBonds>(
        (acc, page) => {
          acc.bonds.push(...page.bonds);
          acc.pagination = page.pagination;
          return acc;
        },
        { bonds: [], pagination: { next_key: "" } },
      );

      return flattenedData;
    },
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    const handleError = ({
      error,
      hasError,
      errorState,
      refetchFunction,
    }: ErrorHandlerParam) => {
      if (hasError && error) {
        showError({
          error: {
            message: error.message,
            errorState: errorState,
            errorTime: new Date(),
          },
          retryAction: refetchFunction,
        });
      }
    };

    handleError({
      error: finalityProvidersError,
      hasError: hasFinalityProvidersError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchFinalityProvidersData,
    });
    handleError({
      error: dAppsError,
      hasError: hasDAppsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchDApps,
    });
    handleError({
      error: bondsError,
      hasError: hasBondsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchBondData,
    });
    handleError({
      error: globalParamsVersionError,
      hasError: hasGlobalParamsVersionError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchGlobalParamsVersion,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasFinalityProvidersError,
    hasGlobalParamsVersionError,
    hasBondsError,
    isRefetchFinalityProvidersError,
  ]);

  // Initializing btc curve is a required one-time operation
  useEffect(() => {
    initBTCCurve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [ShowWalletModalOpen, setShowWalletModalOpen] = useState(false);

  const handleConnectModal = () => {
    setConnectModalOpen(true);
  };

  const handleShowWalletModal = () => {
    setShowWalletModalOpen(true);
  };

  const [burnTokenModalOpen, setBurnTokenModalOpen] = useState(false);

  const handleBurnTokenModal = () => {
    setBurnTokenModalOpen(true);
  };

  const [mintTxModalOpen, setMintTxModalOpen] = useState(false);

  const handleMintTxModal = () => {
    if (dApp) {
      setMintTxModalOpen(true);
    } else {
      toast({
        title: "Warning",
        // @ts-ignore
        description: "Please select a dApp to mint a transaction",
      });
    }
  };

  const handleAddDAppModal = () => {
    setAddDAppModalOpen(true);
  };
  const handleUpdateDAppModal = () => {
    if (!dApp) {
      return;
    }
    setUpdateDAppModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDApp(id);
    refetchDApps();
  };
  const handleAddModal = (value: boolean) => {
    setAddDAppModalOpen(value);
    refetchDApps();
  };
  const handleUpdateModal = (value: boolean) => {
    setUpdateDAppModalOpen(value);
    refetchDApps();
  };

  let totalStakedSat = 0;

  const { network } = useNetwork();

  return (
    <main
      className={`overflow-hidden relative h-full min-h-svh z-0 w-full ${network === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet"}`}
    >
      <div className={"absolute -z-10 left-[9%] top-[5%]"}>
        <div className="absolute h-full bottom-1/2 left-1/2 -translate-x-1/2 aspect-square rounded-full bg-[radial-gradient(37.54%_37.54%_at_50.07%_47.01%,rgba(3,185,216,0.30)_0%,rgba(36,93,137,0.00)_100%)]" />
        <Image alt={"stone"} src={stone} />
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 h-[90%] opacity-[16%] aspect-square rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#F9B55F_0%,rgba(249,181,95,0.00)_100%)] mix-blend-screen blur-[150px]"
          }
        />
        <div
          className={
            "absolute rounded-full h-[200%] aspect-square bg-[radial-gradient(50%_50%_at_50%_50%,#D9D9D9_0%,rgba(217,217,217,0.00)_100%)] top-1/2 -translate-y-1/2 right-1/2 opacity-[30%] mix-blend-hard-light blur-[100px]"
          }
        />
      </div>
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
      />
      <Header onOpenMintTxModal={handleMintTxModal} />
      <div className="container mx-auto flex justify-center p-6">
        <div className="container flex flex-col gap-6">
          <div
            className={
              "flex gap-4 items-end max-lg:flex-col-reverse max-lg:items-stretch"
            }
          >
            <div className={"space-y-2 flex-1"}>
              <h1 className={"text-3xl md:text-[34px] font-medium"}>
                BTC Staking
              </h1>
            </div>
            <Stats />
          </div>
          {address && (
            <Summary
              address={address}
              totalStakedSat={totalStakedSat}
              balanceSat={balance}
            />
          )}
          {/* <StakingBond
            btcHeight={paramWithContext?.currentHeight}
            finalityProviders={finalityProviders?.finalityProviders}
            dApps={dApps?.dApps}
            isLoadingDApps={isLoadingCurrentDApps}
            isWalletConnected={!!btcWallet}
            dApp={dApp}
            setDApp={setDApp}
            onConnect={handleConnectModal}
            onAdd={handleAddDAppModal}
            onUpdate={handleUpdateDAppModal}
            onDelete={handleDelete}
            finalityProvidersFetchNext={fetchNextFinalityProvidersPage}
            finalityProvidersHasNext={hasNextFinalityProvidersPage}
            finalityProvidersIsFetchingMore={
              isFetchingNextFinalityProvidersPage
            }
            isLoading={isLoadingCurrentParams}
            btcWallet={btcWallet}
            btcWalletBalanceSat={btcWalletBalanceSat}
            btcWalletNetwork={btcWalletNetwork}
            address={address}
            publicKeyNoCoord={publicKeyNoCoord}
            setBondsLocalStorage={setBondsLocalStorage}
          /> */}
          {/* {btcWallet &&
            bonds &&
            paramWithContext?.nextBlockParams.currentVersion &&
            btcWalletNetwork &&
            finalityProvidersKV &&
            dApp && (
              <Bonds
                protocolContractAddress={dApp?.scAddress}
                publicKeyNoCoord={publicKeyNoCoord}
                address={address}
                signPsbt={btcWallet.signPsbt}
              />
            )} */}
          {/* <StakersFinalityProviders
            finalityProviders={finalityProvidersData}
            totalActiveTVLSat={stakingStats?.activeTVL}
            connected={!!btcWallet}
          /> */}
        </div>
      </div>

      <Footer />
      {/* <MintTxModal
        btcWalletNetwork={btcWalletNetwork}
        open={mintTxModalOpen}
        onClose={setMintTxModalOpen}
        btcAddress={address}
        btcPublicKey={pubkey}
        dApp={dApp}
        signPsbt={btcWallet?.signPsbt}
      /> */}
      <ConnectModal />
      {/* <ShowWalletModal
        open={ShowWalletModalOpen}
        onClose={setShowWalletModalOpen}
        address={address}
        pubkey={pubkey}
        privkey={privkey}
      />
      <AddDAppModal open={addDAppModalOpen} onClose={handleAddModal} />
      <UpdateDAppModal
        open={updateDAppModalOpen}
        onClose={handleUpdateModal}
        dApp={dApp}
      />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
      <TermsModal open={isTermsOpen} onClose={closeTerms} /> */}
    </main>
  );
};

export default Home;
