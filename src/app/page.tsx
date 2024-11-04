"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { getDApps } from "@/app/api/dApp";
import { DApp as DAppInterface } from "@/app/types/dApps";
import earth from "@/app/assets/earth.webp";

import { StakingBond } from "./components/Staking/StakingBond";
import { Summary } from "./components/Summary/Summary";
import { useError } from "./context/Error/ErrorContext";
import { useWalletInfo } from "./context/WalletProvider";
import { ModalLayout } from "./layout/ModalLayout";
import { ErrorHandlerParam, ErrorState } from "./types/errors";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [dApp, setDApp] = useState<DAppInterface>();

  const { isErrorOpen, showError } = useError();

  const { address, balance } = useWalletInfo();

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

  // const {
  //   data: bonds,
  //   error: bondsError,
  //   isError: hasBondsError,
  //   refetch: refetchBondData,
  // } = useInfiniteQuery({
  //   queryKey: ["bonds", address, xOnlyPubkey],
  //   queryFn: ({ pageParam = "" }) => getBonds(pageParam, xOnlyPubkey),
  //   getNextPageParam: (lastPage) =>
  //     lastPage?.pagination?.next_key !== ""
  //       ? lastPage?.pagination?.next_key
  //       : null,
  //   initialPageParam: "",
  //   refetchInterval: 60000, // 1 minute
  //   enabled: !!(walletProvider && xOnlyPubkey && address),
  //   select: (data) => {
  //     const flattenedData = data.pages.reduce<PaginatedBonds>(
  //       (acc, page) => {
  //         acc.bonds.push(...page.bonds);
  //         acc.pagination = page.pagination;
  //         return acc;
  //       },
  //       { bonds: [], pagination: { next_key: "" } },
  //     );

  //     return flattenedData;
  //   },
  //   retry: (failureCount, error) => {
  //     return !isErrorOpen && failureCount <= 3;
  //   },
  // });

  const handleError = useCallback(
    ({ error, hasError, errorState, refetchFunction }: ErrorHandlerParam) => {
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
    },
    [showError],
  );

  useEffect(() => {
    handleError({
      error: dAppsError,
      hasError: hasDAppsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchDApps,
    });
    // handleError({
    //   error: bondsError,
    //   hasError: hasBondsError,
    //   errorState: ErrorState.SERVER_ERROR,
    //   refetchFunction: refetchBondData,
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDAppsError, dAppsError]);

  let totalStakedSat = 0;

  return (
    <main className="min-h-[80vh]">
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
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
            </div>
          </div>
          {address && (
            <Summary
              address={address}
              totalStakedSat={totalStakedSat}
              balanceSat={balance}
            />
          )}
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
        </div>
      </div>

      <StakingBond
        dApps={dApps?.dApps}
        isLoading={isLoadingCurrentDApps}
        dApp={dApp}
        onSelectDApp={(dApp) => setDApp(dApp)}
      />

      <ModalLayout dApp={dApp} />
      {/* 
      <AddDAppModal open={addDAppModalOpen} onClose={handleAddModal} />
     
      */}
    </main>
  );
};

export default Home;
