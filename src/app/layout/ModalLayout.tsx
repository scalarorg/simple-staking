"use client";

import { Suspense } from "react";

import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { MintTxModal } from "../components/Modals/MintTxModal";
import { PreviewProtocolModal } from "../components/Modals/PreviewProtocolModal";
import { StakeCustodianModal } from "../components/Modals/StakeCustodianModal";
import { UnbondModal } from "../components/Modals/UnbondModal";
import { UnstakeCustodianModal } from "../components/Modals/UnstakeCustodianModal";
import { useError } from "../context/Error/ErrorContext";

export const ModalLayout: React.FC<{}> = ({}) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();

  return (
    <Suspense>
      <ConnectModal />
      <MintTxModal />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
      <PreviewProtocolModal />
      <UnbondModal />
      <StakeCustodianModal />
      <UnstakeCustodianModal />
    </Suspense>
  );
};
