import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useError } from "@/app/context/Error/ErrorContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { fpTableStyles, stakingStyles } from "@/app/scalar/theme";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { ErrorHandlerParam, ErrorState } from "@/app/types/errors";

import { FeedbackModal } from "../Modals/FeedbackModal";

import { DApps } from "./DApps/DApps";

interface OverflowProperties {
  isHeightCap: boolean;
  overTheCapRange: boolean;
  approchingCapRange: boolean;
}

interface StakingProps {
  dApps: DAppInterface[] | undefined;
  isLoading: boolean;
  dApp: DAppInterface | undefined;
  onSelectDApp: (dApp?: DAppInterface) => void;
}

export const StakingBond: React.FC<StakingProps> = ({
  dApps,
  dApp,
  onSelectDApp,
  isLoading,
}) => {
  // Staking form state
  // const [stakingAmountSat, setStakingAmountSat] = useState(0);
  // Selected fee rate, comes from the user input
  // const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  // const [previewModalOpen, setPreviewModalOpen] = useState(false);
  // const [resetFormInputs, setResetFormInputs] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "cancel" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [successFeedbackModalOpened, setSuccessFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-successFeedbackModalOpened", false);
  const [cancelFeedbackModalOpened, setCancelFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-cancelFeedbackModalOpened ", false);
  const { address } = useWalletInfo();
  const { walletProvider } = useWalletProvider();

  // Fetch all UTXOs
  const {
    data: availableUTXOs,
    error: availableUTXOsError,
    isError: hasAvailableUTXOsError,
    refetch: refetchAvailableUTXOs,
  } = useQuery({
    queryKey: ["available UTXOs", address],
    queryFn: async () => {
      if (walletProvider?.getUtxos && address) {
        return await walletProvider.getUtxos(address);
      }
    },
    enabled: !!(walletProvider?.getUtxos && address),
    refetchInterval: 60000 * 5, // 5 minutes
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

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
      error: availableUTXOsError,
      hasError: hasAvailableUTXOsError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchAvailableUTXOs,
    });
  }, [
    availableUTXOsError,
    hasAvailableUTXOsError,
    refetchAvailableUTXOs,
    showError,
  ]);

  // const handleResetState = useCallback(() => {
  //   onSelectDApp(undefined);
  //   setStakingAmountSat(0);
  //   setSelectedFeeRate(0);
  //   setPreviewModalOpen(false);
  //   setResetFormInputs(!resetFormInputs);
  // }, [
  //   onSelectDApp,
  //   setStakingAmountSat,
  //   setSelectedFeeRate,
  //   setPreviewModalOpen,
  //   setResetFormInputs,
  //   resetFormInputs,
  // ]);

  // Either use the selected fee rate or the fastest fee rate
  const handleChooseDApp = (id: string) => {
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
        retryAction: () => handleChooseDApp(id),
      });
      return;
    }

    onSelectDApp(found);
  };

  // const handleStakingAmountSatChange = (inputAmountSat: number) => {
  //   setStakingAmountSat(inputAmountSat);
  // };

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

  // const handleDelete = () => {
  //   if (dApp) {
  //     onDelete(dApp.id);
  //   }
  // };

  // const handlePreviewModalClose = (isOpen: boolean) => {
  //   setPreviewModalOpen(isOpen);
  //   handleFeedbackModal("cancel");
  // };

  // const showOverflowWarning = (overflow: OverflowProperties) => {
  //   if (overflow.isHeightCap) {
  //     return (
  //       <Message
  //         title="Staking window closed"
  //         messages={[
  //           "Staking is temporarily disabled due to the staking window being closed.",
  //           "Please check your staking history to see if any of your stake is tagged overflow.",
  //           "Overflow stake should be unbonded and withdrawn.",
  //         ]}
  //         icon={stakingCapReached}
  //       />
  //     );
  //   } else {
  //     return (
  //       <Message
  //         title="Staking cap reached"
  //         messages={[
  //           "Staking is temporarily disabled due to the staking cap getting reached.",
  //           "Please check your staking history to see if any of your stake is tagged overflow.",
  //           "Overflow stake should be unbonded and withdrawn.",
  //         ]}
  //         icon={stakingCapReached}
  //       />
  //     );
  //   }
  // };

  const handleCloseFeedbackModal = () => {
    if (feedbackModal.type === "success") {
      setSuccessFeedbackModalOpened(true);
    } else if (feedbackModal.type === "cancel") {
      setCancelFeedbackModalOpened(true);
    }
    setFeedbackModal({ type: null, isOpen: false });
  };

  // const renderStakingForm = () => {
  //   // States of the staking form:
  //   // 1. Wallet is not connected
  //   if (!walletProvider) {
  //     return <WalletNotConnected onConnect={connectWallet} />;
  //   }
  //   // 2. Wallet is connected but we are still loading the staking params
  //   else if (isLoading) {
  //     return <LoadingView />;
  //   }
  //   // 6. Staking form
  //   else {
  //     return (
  //       <>
  //         {/* <div className="flex flex-1 flex-col"> */}
  //         {/* <StakingAmount
  //               btcWalletBalanceSat={balance}
  //               onStakingAmountSatChange={handleStakingAmountSatChange}
  //               reset={resetFormInputs}
  //             /> */}
  //         {/* <StakingFee
  //               stakingFeeSat={stakingFeeSat}
  //               selectedFeeRate={selectedFeeRate}
  //               onSelectedFeeRateChange={setSelectedFeeRate}
  //               reset={resetFormInputs}
  //             /> */}
  //         {/* </div> */}
  //         <Tooltip id="tooltip-staking-preview" />
  //         <PreviewModal
  //           open={previewModalOpen}
  //           onClose={handlePreviewModalClose}
  //           stakingAmountSat={stakingAmountSat}
  //           feeRate={feeRate}
  //         />
  //       </>
  //     );
  //   }
  // };

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
      {/* <div className="flex flex-col gap-4 lg:flex-row">
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
      </div> */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div
          className={`flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3 ${fpTableStyles}`}
        >
          <DApps
            isLoading={isLoading}
            dApps={dApps}
            selectedDApp={dApp}
            onDAppChange={handleChooseDApp}
          />
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
