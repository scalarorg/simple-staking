"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { initBTCCurve } from "btc-staking-ts";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { deleteDApp, getDApps } from "@/app/api/dApp";
import earth from "@/app/assets/earth.webp";
import stone from "@/app/assets/stone.webp";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { GLOBAL_NETWORK_INSTANCE } from "@/config/network.config";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet/index";
import { RegtestWallet } from "@/utils/wallet/providers/regtest_wallet";
import { Network, WalletProvider } from "@/utils/wallet/wallet_provider";

import { PaginatedDelegations, getDelegations } from "./api/getDelegations";
import {
  PaginatedFinalityProviders,
  getFinalityProviders,
} from "./api/getFinalityProviders";
import { getGlobalParams } from "./api/getGlobalParams";
import { signPsbtTransaction } from "./common/utils/psbt";
import { Delegations } from "./components/Delegations/Delegations";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { AddDAppModal } from "./components/Modals/AddDAppModal";
import { BurnTokenModal } from "./components/Modals/BurnTokenModal";
import { ConnectModal } from "./components/Modals/ConnectModal";
import { ErrorModal } from "./components/Modals/ErrorModal";
import { MintTxModal } from "./components/Modals/MintTxModal";
import { ShowWalletModal } from "./components/Modals/ShowWalletModal";
import { SignTxModal } from "./components/Modals/SignTxModal";
import { TermsModal } from "./components/Modals/Terms/TermsModal";
import { UpdateDAppModal } from "./components/Modals/UpdateDAppModal";
import { Staking } from "./components/Staking/Staking";
import { Stats } from "./components/Stats/Stats";
import { Summary } from "./components/Summary/Summary";
import { useError } from "./context/Error/ErrorContext";
import { useTerms } from "./context/Terms/TermsContext";
import { Delegation, DelegationState } from "./types/delegations";
import { ErrorHandlerParam, ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [btcWallet, setBTCWallet] = useState<WalletProvider>();
  const [btcWalletBalanceSat, setBTCWalletBalanceSat] = useState(0);
  const [btcWalletNetwork, setBTCWalletNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [addDAppModalOpen, setAddDAppModalOpen] = useState(false);
  const [updateDAppModalOpen, setUpdateDAppModalOpen] = useState(false);
  const [dApp, setDApp] = useState<DAppInterface>();

  const [address, setAddress] = useState("");
  const [pubkey, setPubkey] = useState("");
  const [privkey, setPrivkey] = useState("");
  const [inputPrivkey, setInputPrivkey] = useState("");
  const { error, isErrorOpen, showError, hideError, retryErrorAction } =
    useError();
  const { isTermsOpen, closeTerms } = useTerms();

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
        btcWallet!.getBTCTipHeight(),
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
    enabled: !!btcWallet,
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
    data: delegations,
    fetchNextPage: fetchNextDelegationsPage,
    hasNextPage: hasNextDelegationsPage,
    isFetchingNextPage: isFetchingNextDelegationsPage,
    error: delegationsError,
    isError: hasDelegationsError,
    refetch: refetchDelegationData,
  } = useInfiniteQuery({
    queryKey: ["delegations", address, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: 60000, // 1 minute
    enabled: !!(btcWallet && publicKeyNoCoord && address),
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedDelegations>(
        (acc, page) => {
          acc.delegations.push(...page.delegations);
          acc.pagination = page.pagination;
          return acc;
        },
        { delegations: [], pagination: { next_key: "" } },
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
      error: delegationsError,
      hasError: hasDelegationsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchDelegationData,
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
    hasDelegationsError,
    isRefetchFinalityProvidersError,
  ]);

  // Initializing btc curve is a required one-time operation
  useEffect(() => {
    initBTCCurve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local storage state for delegations
  const delegationsLocalStorageKey =
    getDelegationsLocalStorageKey(publicKeyNoCoord);

  const [delegationsLocalStorage, setDelegationsLocalStorage] = useLocalStorage<
    Delegation[]
  >(delegationsLocalStorageKey, []);

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
  const [signTxModalOpen, setSignTxModalOpen] = useState(false);
  const [isInputPrivkey, setIsInputPrivkey] = useState<any>(null);

  const handleMintTxModal = () => {
    setMintTxModalOpen(true);
  };

  const waitForPrivateKey = () => {
    setSignTxModalOpen(true);
    return new Promise<string>((resolve) => {
      const getPrivateKeyWIF = (privkey: string) => {
        setSignTxModalOpen(false);
        resolve(privkey);
      };
      setIsInputPrivkey(() => getPrivateKeyWIF);
    });
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

  const handleDisconnectBTC = () => {
    setBTCWallet(undefined);
    setBTCWalletBalanceSat(0);
    setBTCWalletNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
    setPubkey("");
    setPrivkey("");
  };

  const handleConnectBTC = async (walletProvider: WalletProvider) => {
    // close the modal
    setConnectModalOpen(false);

    try {
      await walletProvider.connectWallet();
      const address = await walletProvider.getAddress();
      // check if the wallet address type is supported in babylon
      const supported = isSupportedAddressType(address);
      if (!supported) {
        throw new Error(
          "Invalid address type. Please use a Native SegWit or Taproot",
        );
      }

      const balanceSat = await walletProvider.getBalance();
      const pubkeyHex = await walletProvider.getPublicKeyHex();
      setPubkey(pubkeyHex);
      const publicKeyNoCoord = getPublicKeyNoCoord(pubkeyHex);
      setBTCWallet(walletProvider);
      setBTCWalletBalanceSat(balanceSat);
      setBTCWalletNetwork(toNetwork(await walletProvider.getNetwork()));
      setAddress(address);
      setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
      if (walletProvider instanceof RegtestWallet) {
        setPrivkey(await walletProvider.getPrivateKeyWIF());
        setShowWalletModalOpen(true);
      }
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
        retryAction: () => handleConnectBTC(walletProvider),
      });
    }
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
  // Subscribe to account changes
  useEffect(() => {
    if (btcWallet) {
      let once = false;
      btcWallet.on("accountChanged", () => {
        if (!once) {
          handleConnectBTC(btcWallet);
        }
      });
      return () => {
        once = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcWallet]);

  // Clean up the local storage delegations
  useEffect(() => {
    if (!delegations?.delegations) {
      return;
    }

    const updateDelegationsLocalStorage = async () => {
      const { areDelegationsDifferent, delegations: newDelegations } =
        await calculateDelegationsDiff(
          delegations.delegations,
          delegationsLocalStorage,
        );
      if (areDelegationsDifferent) {
        setDelegationsLocalStorage(newDelegations);
      }
    };

    updateDelegationsLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegations, setDelegationsLocalStorage, delegationsLocalStorage]);

  // Finality providers key-value map { pk: moniker }
  const finalityProvidersKV = finalityProviders?.finalityProviders.reduce(
    (acc, fp) => ({ ...acc, [fp?.btcPk]: fp?.description?.moniker }),
    {},
  );

  let totalStakedSat = 0;

  if (delegations) {
    totalStakedSat = delegations.delegations
      // using only active delegations
      .filter((delegation) => delegation?.state === DelegationState.ACTIVE)
      .reduce(
        (accumulator: number, item) => accumulator + item?.stakingValueSat,
        0,
      );
  }

  return (
    <main
      className={`overflow-hidden relative h-full min-h-svh z-0 w-full ${GLOBAL_NETWORK_INSTANCE === Network.MAINNET ? "main-app-mainnet" : "main-app-testnet"}`}
    >
      {/*BACKGROUND start here*/}

      {/*Left start*/}
      <div className={"absolute -z-10 left-[9%] top-[5%]"}>
        <div className="absolute h-full bottom-1/2 left-1/2 -translate-x-1/2 aspect-square rounded-full bg-[radial-gradient(37.54%_37.54%_at_50.07%_47.01%,rgba(3,185,216,0.30)_0%,rgba(36,93,137,0.00)_100%)]" />
        <Image alt={"stone"} src={stone} />

        {/*Radiants*/}
        {/*in the middle*/}
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 h-[90%] opacity-[16%] aspect-square rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#F9B55F_0%,rgba(249,181,95,0.00)_100%)] mix-blend-screen blur-[150px]"
          }
        />
        {/*on the left*/}
        <div
          className={
            "absolute rounded-full h-[200%] aspect-square bg-[radial-gradient(50%_50%_at_50%_50%,#D9D9D9_0%,rgba(217,217,217,0.00)_100%)] top-1/2 -translate-y-1/2 right-1/2 opacity-[30%] mix-blend-hard-light blur-[100px]"
          }
        />
      </div>
      {/*Left end*/}

      {/*Right start*/}
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
      />
      {/*Right end*/}

      {/*BACKGROUND end here*/}
      {/*<NetworkBadge />*/}
      <Header
        onOpenBurnTokenModal={handleBurnTokenModal}
        onOpenMintTxModal={handleMintTxModal}
        onConnect={handleConnectModal}
        onDisconnect={handleDisconnectBTC}
        address={address}
        balanceSat={btcWalletBalanceSat}
        onOpenExportPrivateKeyModal={handleShowWalletModal}
      />
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
              {/* <p>
                Select a finality provider or{" "}
                <a
                  href="https://github.com/babylonchain/networks/tree/main/bbn-test-4/finality-providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sublink text-primary hover:underline"
                >
                  create your own
                </a>
                .
              </p> */}
            </div>
            <Stats />
          </div>
          {address && (
            <Summary
              address={address}
              totalStakedSat={totalStakedSat}
              balanceSat={btcWalletBalanceSat}
            />
          )}
          <Staking
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
            setDelegationsLocalStorage={setDelegationsLocalStorage}
          />
          {btcWallet &&
            delegations &&
            paramWithContext?.nextBlockParams.currentVersion &&
            btcWalletNetwork &&
            finalityProvidersKV && (
              <Delegations
                finalityProvidersKV={finalityProvidersKV}
                delegationsAPI={delegations.delegations}
                delegationsLocalStorage={delegationsLocalStorage}
                globalParamsVersion={
                  paramWithContext.nextBlockParams.currentVersion
                }
                publicKeyNoCoord={publicKeyNoCoord}
                btcWalletNetwork={btcWalletNetwork}
                address={address}
                signPsbtTx={signPsbtTransaction(btcWallet)}
                pushTx={btcWallet.pushTx}
                queryMeta={{
                  next: fetchNextDelegationsPage,
                  hasMore: hasNextDelegationsPage,
                  isFetchingMore: isFetchingNextDelegationsPage,
                }}
                getNetworkFees={btcWallet.getNetworkFees}
              />
            )}
          {/* At this point of time is not used */}
          {/* <StakersFinalityProviders
            finalityProviders={finalityProvidersData}
            totalActiveTVLSat={stakingStats?.activeTVL}
            connected={!!btcWallet}
          /> */}
        </div>
      </div>

      {/*<FAQ />*/}
      <Footer />
      <BurnTokenModal
        open={burnTokenModalOpen}
        onClose={setBurnTokenModalOpen}
        btcAddress={address}
        signPsbt={btcWallet?.signPsbt}
      />
      <MintTxModal
        btcWalletNetwork={btcWalletNetwork}
        open={mintTxModalOpen}
        onClose={setMintTxModalOpen}
        btcAddress={address}
        btcPublicKey={pubkey}
        dApp={dApp}
        signPsbt={btcWallet?.signPsbt}
        waitForPrivateKey={waitForPrivateKey}
      />
      <SignTxModal
        open={signTxModalOpen}
        onClose={setSignTxModalOpen}
        onSign={isInputPrivkey}
        address={address}
      />
      <ConnectModal
        open={connectModalOpen}
        onClose={setConnectModalOpen}
        onConnect={handleConnectBTC}
        connectDisabled={!!address}
      />
      <ShowWalletModal
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
      <TermsModal open={isTermsOpen} onClose={closeTerms} />
    </main>
  );
};

export default Home;
