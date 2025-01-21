"use client";

import { Suspense } from "react";

import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { BaseTransferModal } from "../components/Modals/TransferModal/BaseTransferModal";
import { useError } from "../context/Error/ErrorContext";
import { useTransferModal } from "../stores/modal";

export const ModalLayout: React.FC<{}> = ({}) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();
  const { isOpen: isTransferModalOpen, protocol, close } = useTransferModal();

  return (
    <Suspense>
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
      {isTransferModalOpen && protocol && (
        <BaseTransferModal protocol={protocol} close={close} />
      )}
    </Suspense>
  );
};
