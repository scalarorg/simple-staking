"use client";

import { Suspense } from "react";

import { AddDAppModal } from "../components/Modals/AddDAppModal";
import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { StakeCustodialModal } from "../components/Modals/StakeCustodialModal";
import { UnbondModal } from "../components/Modals/UnbondModal";
import { UnstakeCustodialModal } from "../components/Modals/UnstakeCustodialModal";
import { UpdateDAppModal } from "../components/Modals/UpdateDAppModal";
import { useError } from "../context/Error/ErrorContext";
import { MintTxModal } from "../components/Modals/MintTxModal";

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
      <StakeCustodialModal />
      <UnstakeCustodialModal />
    </Suspense>
  );
};
