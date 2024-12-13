"use client";

import { Suspense } from "react";

import { AddDAppModal } from "../components/Modals/AddDAppModal";
import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { MintTxModal } from "../components/Modals/MintTxModal";
import { StakeCustodianModal } from "../components/Modals/StakeCustodianModal";
import { UnbondModal } from "../components/Modals/UnbondModal";
import { UnstakeCustodianModal } from "../components/Modals/UnstakeCustodianModal";
import { UpdateDAppModal } from "../components/Modals/UpdateDAppModal";
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
      <UpdateDAppModal />
      <AddDAppModal />
      <UnbondModal />
      <StakeCustodianModal />
      <UnstakeCustodianModal />
    </Suspense>
  );
};
