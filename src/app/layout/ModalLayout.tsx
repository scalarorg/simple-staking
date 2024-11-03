"use client";

import { Suspense } from "react";

import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import MintTxModal from "../components/Modals/MintTxModal";
import { useError } from "../context/Error/ErrorContext";
import { DApp } from "../types/dApps";

export const ModalLayout: React.FC<{ dApp?: DApp }> = ({ dApp }) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();

  return (
    <Suspense>
      <ConnectModal />
      {dApp && <MintTxModal dApp={dApp} />}
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
    </Suspense>
  );
};
