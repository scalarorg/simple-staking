import { useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { Tooltip } from "react-tooltip";
import { useLocalStorage } from "usehooks-ts";

import { OVERFLOW_HEIGHT_WARNING_THRESHOLD } from "@/app/common/constants";
import { LoadingView } from "@/app/components/Loading/Loading";
import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { useStakingStats } from "@/app/context/api/StakingStatsProvider";
import { useError } from "@/app/context/Error/ErrorContext";
import { fpTableStyles, stakingStyles } from "@/app/scalar/theme";
import { Bond } from "@/app/types/bonds";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { ErrorHandlerParam, ErrorState } from "@/app/types/errors";
import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { createStakingTx, signStakingTx } from "@/utils/bonds/signStakingTx";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import {
  getCurrentGlobalParamsVersion,
  ParamsWithContext,
} from "@/utils/globalParams";
import { isStakingSignReady } from "@/utils/isStakingSignReady";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

import { AddDAppButton } from "../Button/AddDAppButton";
import { FeedbackModal } from "../Modals/FeedbackModal";
import { PreviewModal } from "../Modals/PreviewModal";

import { DApps } from "./DApps/DApps";
import { StakingAmount } from "./Form/StakingAmount";
import { StakingFee } from "./Form/StakingFee";
import { StakingTime } from "./Form/StakingTime";
import { Message } from "./Form/States/Message";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";

interface OverflowProperties {
  isHeightCap: boolean;
  overTheCapRange: boolean;
  approchingCapRange: boolean;
}

interface StakingProps {
  btcHeight: number | undefined;
  finalityProviders: FinalityProviderInterface[] | undefined;
  dApps: DAppInterface[] | undefined;
  isWalletConnected: boolean;
  isLoading: boolean;
  isLoadingDApps: boolean;
  dApp: DAppInterface | undefined;
  setDApp: Dispatch<SetStateAction<DAppInterface | undefined>>;
  onConnect: () => void;
  onAdd: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  finalityProvidersFetchNext: () => void;
  finalityProvidersHasNext: boolean;
  finalityProvidersIsFetchingMore: boolean;
  btcWallet: WalletProvider | undefined;
  btcWalletBalanceSat: number;
  btcWalletNetwork: networks.Network | undefined;
  address: string | undefined;
  publicKeyNoCoord: string;
  setBondsLocalStorage: Dispatch<SetStateAction<Bond[]>>;
}

export const StakingBond: React.FC<StakingProps> = ({
  btcHeight,
  finalityProviders,
  dApps,
  isWalletConnected,
  isLoadingDApps,
  dApp,
  setDApp,
  onConnect,
  onAdd,
  onUpdate,
  onDelete,
  finalityProvidersFetchNext,
  finalityProvidersHasNext,
  finalityProvidersIsFetchingMore,
  isLoading,
  btcWallet,
  btcWalletNetwork,
  address,
  publicKeyNoCoord,
  setBondsLocalStorage,
  btcWalletBalanceSat,
}) => {
  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  const [finalityProvider, setFinalityProvider] =
    useState<FinalityProviderInterface>();

  // Selected fee rate, comes from the user input
  const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetFormInputs, setResetFormInputs] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "cancel" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [successFeedbackModalOpened, setSuccessFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-successFeedbackModalOpened", false);
  const [cancelFeedbackModalOpened, setCancelFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-cancelFeedbackModalOpened ", false);
  const [paramWithCtx, setParamWithCtx] = useState<
    ParamsWithContext | undefined
  >();
  const [overflow, setOverflow] = useState<OverflowProperties>({
    isHeightCap: false,
    overTheCapRange: false,
    approchingCapRange: false,
  });

  // Mempool fee rates, comes from the network
  // Fetch fee rates, sat/vB
  const {
    data: mempoolFeeRates,
    error: mempoolFeeRatesError,
    isError: hasMempoolFeeRatesError,
    refetch: refetchMempoolFeeRates,
  } = useQuery({
    queryKey: ["mempool fee rates"],
    queryFn: async () => {
      if (btcWallet?.getNetworkFees) {
        return await btcWallet.getNetworkFees();
      }
    },
    enabled: !!btcWallet?.getNetworkFees,
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  // Fetch all UTXOs
  const {
    data: availableUTXOs,
    error: availableUTXOsError,
    isError: hasAvailableUTXOsError,
    refetch: refetchAvailableUTXOs,
  } = useQuery({
    queryKey: ["available UTXOs", address],
    queryFn: async () => {
      if (btcWallet?.getUtxos && address) {
        return await btcWallet.getUtxos(address);
      }
    },
    enabled: !!(btcWallet?.getUtxos && address),
    refetchInterval: 60000 * 5, // 5 minutes
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const stakingStats = useStakingStats();

  // load global params and calculate the current staking params
  const globalParams = useGlobalParams();
  useMemo(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    setParamWithCtx(paramCtx);
  }, [btcHeight, globalParams]);

  // Calculate the overflow properties
  useMemo(() => {
    if (!paramWithCtx || !paramWithCtx.currentVersion || !btcHeight) {
      return;
    }
    const nextBlockHeight = btcHeight + 1;
    const { stakingCapHeight, stakingCapSat, confirmationDepth } =
      paramWithCtx.currentVersion;
    // Use height based cap than value based cap if it is set
    if (stakingCapHeight) {
      setOverflow({
        isHeightCap: true,
        overTheCapRange:
          nextBlockHeight >= stakingCapHeight + confirmationDepth,
        /*
          When btc height is approching the staking cap height,
          there is higher chance of overflow due to tx not being included in the next few blocks on time
          We also don't take the confirmation depth into account here as majority
          of the bond will be overflow after the cap is reached, unless btc fork happens but it's unlikely
        */
        approchingCapRange:
          nextBlockHeight >=
          stakingCapHeight - OVERFLOW_HEIGHT_WARNING_THRESHOLD,
      });
    } else if (stakingCapSat && stakingStats.data) {
      const { activeTVLSat, unconfirmedTVLSat } = stakingStats.data;
      setOverflow({
        isHeightCap: false,
        overTheCapRange: stakingCapSat <= activeTVLSat,
        approchingCapRange:
          stakingCapSat * OVERFLOW_HEIGHT_WARNING_THRESHOLD < unconfirmedTVLSat,
      });
    }
  }, [paramWithCtx, btcHeight, stakingStats]);

  const { coinName } = getNetworkConfig();
  const stakingParams = paramWithCtx?.currentVersion;
  const firstActivationHeight = paramWithCtx?.firstActivationHeight;
  const isUpgrading = paramWithCtx?.isApprochingNextVersion;
  const isBlockHeightUnderActivation =
    !stakingParams ||
    (btcHeight &&
      firstActivationHeight &&
      btcHeight + 1 < firstActivationHeight);

  const { isErrorOpen, showError } = useError();

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
            errorState,
            errorTime: new Date(),
          },
          retryAction: refetchFunction,
        });
      }
    };

    handleError({
      error: mempoolFeeRatesError,
      hasError: hasMempoolFeeRatesError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchMempoolFeeRates,
    });
    handleError({
      error: availableUTXOsError,
      hasError: hasAvailableUTXOsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchAvailableUTXOs,
    });
  }, [
    availableUTXOsError,
    mempoolFeeRatesError,
    hasMempoolFeeRatesError,
    hasAvailableUTXOsError,
    refetchMempoolFeeRates,
    refetchAvailableUTXOs,
    showError,
  ]);

  const handleResetState = () => {
    setFinalityProvider(undefined);
    setDApp(undefined);
    setStakingAmountSat(0);
    setStakingTimeBlocks(0);
    setSelectedFeeRate(0);
    setPreviewModalOpen(false);
    setResetFormInputs(!resetFormInputs);
  };

  const { minFeeRate, defaultFeeRate } = getFeeRateFromMempool(mempoolFeeRates);

  // Either use the selected fee rate or the fastest fee rate
  const feeRate = selectedFeeRate || defaultFeeRate;

  const handleSign = async () => {
    try {
      // Initial validation
      if (!btcWallet) throw new Error("Wallet is not connected");
      if (!address) throw new Error("Address is not set");
      if (!btcWalletNetwork) throw new Error("Wallet network is not connected");
      if (!finalityProvider)
        throw new Error("Finality provider is not selected");
      if (!dApp) throw new Error("DApp is not selected");
      if (!paramWithCtx || !paramWithCtx.currentVersion)
        throw new Error("Global params not loaded");
      if (!feeRate) throw new Error("Fee rates not loaded");
      if (!availableUTXOs || availableUTXOs.length === 0)
        throw new Error("No available balance");

      const { currentVersion: globalParamsVersion } = paramWithCtx;
      // Sign the staking transaction
      const { stakingTxHex, stakingTerm } = await signStakingTx(
        btcWallet,
        globalParamsVersion,
        stakingAmountSat,
        stakingTimeBlocks,
        finalityProvider.btcPk,
        btcWalletNetwork,
        address,
        publicKeyNoCoord,
        feeRate,
        availableUTXOs,
      );
      // UI
      handleFeedbackModal("success");
      handleLocalStorageBonds(stakingTxHex, stakingTerm);
      handleResetState();
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: handleSign,
      });
    }
  };

  // Save the bond to local storage
  const handleLocalStorageBonds = (
    signedTxHex: string,
    stakingTerm: number,
  ) => {
    // setBondsLocalStorage((bonds) => [
    //   toLocalStorageBond(
    //     Transaction.fromHex(signedTxHex).getId(),
    //     publicKeyNoCoord,
    //     finalityProvider!.btcPk,
    //     stakingAmountSat,
    //     signedTxHex,
    //     stakingTerm,
    //   ),
    //   ...bonds,
    // ]);
  };

  // Memoize the staking fee calculation
  const stakingFeeSat = useMemo(() => {
    if (
      btcWalletNetwork &&
      address &&
      publicKeyNoCoord &&
      stakingAmountSat &&
      finalityProvider &&
      paramWithCtx?.currentVersion &&
      mempoolFeeRates &&
      availableUTXOs
    ) {
      try {
        // check that selected Fee rate (if present) is bigger than the min fee
        if (selectedFeeRate && selectedFeeRate < minFeeRate) {
          throw new Error("Selected fee rate is lower than the hour fee");
        }
        const memoizedFeeRate = selectedFeeRate || defaultFeeRate;
        // Calculate the staking fee
        const { stakingFeeSat } = createStakingTx(
          paramWithCtx.currentVersion,
          stakingAmountSat,
          stakingTimeBlocks,
          finalityProvider.btcPk,
          btcWalletNetwork,
          address,
          publicKeyNoCoord,
          memoizedFeeRate,
          availableUTXOs,
        );
        return stakingFeeSat;
      } catch (error: Error | any) {
        // fees + staking amount can be more than the balance
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.STAKING,
            errorTime: new Date(),
          },
          retryAction: () => setSelectedFeeRate(0),
        });
        setSelectedFeeRate(0);
        return 0;
      }
    } else {
      return 0;
    }
  }, [
    btcWalletNetwork,
    address,
    publicKeyNoCoord,
    stakingAmountSat,
    stakingTimeBlocks,
    finalityProvider,
    paramWithCtx,
    mempoolFeeRates,
    selectedFeeRate,
    availableUTXOs,
    showError,
    defaultFeeRate,
    minFeeRate,
  ]);

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    let found: FinalityProviderInterface | undefined;
    try {
      if (!finalityProviders) {
        throw new Error("Finality providers not loaded");
      }

      found = finalityProviders.find((fp) => fp?.btcPk === btcPkHex);
      if (!found) {
        throw new Error("Finality provider not found");
      }

      if (found.btcPk === publicKeyNoCoord) {
        throw new Error(
          "Cannot select a finality provider with the same public key as the wallet",
        );
      }
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: () => handleChooseFinalityProvider(btcPkHex),
      });
      return;
    }

    setFinalityProvider(found);
  };

  const HandleChooseDApp = (id: string) => {
    let found: DAppInterface | undefined;
    try {
      if (!dApps) {
        throw new Error("DApps not loaded");
      }

      found = dApps.find((da) => da?.id === id);
      if (!found) {
        throw new Error("DApp not found");
      }
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: () => HandleChooseDApp(id),
      });
      return;
    }

    setDApp(found);
  };

  const handleStakingAmountSatChange = (inputAmountSat: number) => {
    setStakingAmountSat(inputAmountSat);
  };

  const handleStakingTimeBlocksChange = (inputTimeBlocks: number) => {
    setStakingTimeBlocks(inputTimeBlocks);
  };

  // Show feedback modal only once for each type
  const handleFeedbackModal = (type: "success" | "cancel") => {
    if (!feedbackModal.isOpen && feedbackModal.type !== type) {
      const isFeedbackModalOpened =
        type === "success"
          ? successFeedbackModalOpened
          : cancelFeedbackModalOpened;
      if (!isFeedbackModalOpened) {
        setFeedbackModal({ type, isOpen: true });
      }
    }
  };

  const handleDelete = () => {
    if (dApp) {
      onDelete(dApp.id);
    }
  };

  const handlePreviewModalClose = (isOpen: boolean) => {
    setPreviewModalOpen(isOpen);
    handleFeedbackModal("cancel");
  };

  const showOverflowWarning = (overflow: OverflowProperties) => {
    if (overflow.isHeightCap) {
      return (
        <Message
          title="Staking window closed"
          messages={[
            "Staking is temporarily disabled due to the staking window being closed.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    } else {
      return (
        <Message
          title="Staking cap reached"
          messages={[
            "Staking is temporarily disabled due to the staking cap getting reached.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    }
  };

  const handleCloseFeedbackModal = () => {
    if (feedbackModal.type === "success") {
      setSuccessFeedbackModalOpened(true);
    } else if (feedbackModal.type === "cancel") {
      setCancelFeedbackModalOpened(true);
    }
    setFeedbackModal({ type: null, isOpen: false });
  };

  const showApproachingCapWarning = () => {
    if (!overflow.approchingCapRange) {
      return;
    }
    if (overflow.isHeightCap) {
      return (
        <p className="text-center text-sm text-error">
          Staking window is closing. Your stake may <b>overflow</b>!
        </p>
      );
    }
    return (
      <p className="text-center text-sm text-error">
        Staking cap is filling up. Your stake may <b>overflow</b>!
      </p>
    );
  };

  const renderStakingForm = () => {
    // States of the staking form:
    // 1. Wallet is not connected
    if (!isWalletConnected) {
      return <WalletNotConnected onConnect={onConnect} />;
    }
    // 2. Wallet is connected but we are still loading the staking params
    else if (isLoading) {
      return <LoadingView />;
    }
    // 3. Staking has not started yet
    else if (isBlockHeightUnderActivation) {
      return (
        <Message
          title="Staking has not yet started"
          messages={[
            `Staking will be activated once ${coinName} block height passes ${firstActivationHeight ? firstActivationHeight - 1 : "-"}. The current ${coinName} block height is ${btcHeight || "-"}.`,
          ]}
          icon={stakingNotStarted}
        />
      );
    }
    // 4. Staking params upgrading
    else if (isUpgrading) {
      return (
        <Message
          title="Staking parameters upgrading"
          messages={[
            "The staking parameters are getting upgraded, staking will be re-enabled soon.",
          ]}
          icon={stakingUpgrading}
        />
      );
    }
    // 5. Staking cap reached
    else if (overflow.overTheCapRange) {
      return showOverflowWarning(overflow);
    }
    // 6. Staking form
    else {
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        unbondingTime,
      } = stakingParams;

      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;

      // Takes into account the fixed staking time
      const stakingTimeBlocksWithFixed = stakingTimeFixed
        ? minStakingTimeBlocks
        : stakingTimeBlocks;

      // Check if the staking transaction is ready to be signed
      const { isReady: signReady, reason: signNotReadyReason } =
        isStakingSignReady(
          minStakingAmountSat,
          maxStakingAmountSat,
          minStakingTimeBlocks,
          maxStakingTimeBlocks,
          stakingAmountSat,
          stakingTimeBlocksWithFixed,
          !!finalityProvider,
        );

      const previewReady =
        signReady && feeRate && availableUTXOs && stakingAmountSat;

      return (
        <>
          <p>Set up staking terms</p>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              <StakingTime
                minStakingTimeBlocks={minStakingTimeBlocks}
                maxStakingTimeBlocks={maxStakingTimeBlocks}
                unbondingTimeBlocks={stakingParams.unbondingTime}
                onStakingTimeBlocksChange={handleStakingTimeBlocksChange}
                reset={resetFormInputs}
              />
              <StakingAmount
                minStakingAmountSat={minStakingAmountSat}
                maxStakingAmountSat={maxStakingAmountSat}
                btcWalletBalanceSat={btcWalletBalanceSat}
                onStakingAmountSatChange={handleStakingAmountSatChange}
                reset={resetFormInputs}
              />
              {signReady && (
                <StakingFee
                  mempoolFeeRates={mempoolFeeRates}
                  stakingFeeSat={stakingFeeSat}
                  selectedFeeRate={selectedFeeRate}
                  onSelectedFeeRateChange={setSelectedFeeRate}
                  reset={resetFormInputs}
                />
              )}
            </div>
            {showApproachingCapWarning()}
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id="tooltip-staking-preview"
              data-tooltip-content={signNotReadyReason}
              data-tooltip-place="top"
            >
              <button
                className="btn-primary btn mt-2 w-full"
                disabled={!previewReady}
                onClick={() => setPreviewModalOpen(true)}
              >
                Preview
              </button>
              <Tooltip id="tooltip-staking-preview" />
            </span>
            {previewReady && (
              <PreviewModal
                open={previewModalOpen}
                onClose={handlePreviewModalClose}
                onSign={handleSign}
                finalityProvider={finalityProvider?.description.moniker}
                stakingAmountSat={stakingAmountSat}
                stakingTimeBlocks={stakingTimeBlocksWithFixed}
                stakingFeeSat={stakingFeeSat}
                feeRate={feeRate}
                unbondingTimeBlocks={unbondingTime}
              />
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div
      className={`
        card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1
        ${stakingStyles}
        `}
    >
      {/*<h3 className="mb-4 font-bold">Staking</h3>*/}
      {/* <div className="flex flex-col gap-4 lg:flex-row">
        <div
          className={`
              flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3
              ${fpTableStyles}
              `}
        >
          <FinalityProviders
            finalityProviders={finalityProviders}
            selectedFinalityProvider={finalityProvider}
            onFinalityProviderChange={handleChooseFinalityProvider}
            queryMeta={{
              next: finalityProvidersFetchNext,
              hasMore: finalityProvidersHasNext,
              isFetchingMore: finalityProvidersIsFetchingMore,
            }}
          />
        </div>
        //COMMENT THIS ONE <div className="divider m-0 lg:divider-horizontal lg:m-0" />
        <div
          className={`
                flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3
                ${fpTableStyles}
                `}
        >
          {renderStakingForm()}
        </div>
      </div> */}
      {/*<h3 className="mb-4 font-bold">Staking</h3>*/}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-row gap-4 lg:basis-3/5 xl:basis-2/3">
          <div className="flex flex-1 justify-end items-center gap-2">
            <div className="flex mr-1">
              <AddDAppButton onAdd={onAdd} />
            </div>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={handleDelete}
            >
              <FaTrash />
            </button>
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onUpdate}
              disabled={!dApp}
            >
              <FaPenToSquare />
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3"></div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div
          className={`
              flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3
              ${fpTableStyles}
              `}
        >
          <DApps
            isLoading={isLoadingDApps}
            dApps={dApps}
            selectedDApp={dApp}
            onDAppChange={HandleChooseDApp}
          />
        </div>
        {/*<div className="divider m-0 lg:divider-horizontal lg:m-0" />*/}
        <div
          className={`
                flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3
                ${fpTableStyles}
                `}
        >
          {renderStakingForm()}
        </div>
      </div>
      <FeedbackModal
        open={feedbackModal.isOpen}
        onClose={handleCloseFeedbackModal}
        type={feedbackModal.type}
      />
    </div>
  );
};
