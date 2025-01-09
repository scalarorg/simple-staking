"use client";

import { Suspense } from "react";

import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { TransferModal } from "../components/Modals/TransferModal";
import { useError } from "../context/Error/ErrorContext";
import { useGeneralModal, useTransferModal } from "../stores/modal";

export const ModalLayout: React.FC<{}> = ({}) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();
  const { isOpen: isTransferModalOpen } = useTransferModal();
  const { isOpen } = useGeneralModal();

  return (
    <Suspense>
      {/* <MintTxModal /> */}
      {isErrorOpen && (
        <ErrorModal
          open={isErrorOpen}
          errorMessage={error.message}
          errorState={error.errorState}
          errorTime={error.errorTime}
          onClose={hideError}
          onRetry={retryErrorAction}
        />
      )}
      <ConnectModal />
      {/* <PreviewProtocolModal /> */}
      {/* <UnbondModal />
      <StakeCustodianModal />
      {/* <UnstakeCustodianModal /> */}
      {isTransferModalOpen && <TransferModal />}
    </Suspense>
  );
};
