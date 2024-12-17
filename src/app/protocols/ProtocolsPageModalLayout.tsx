"use client";

import { Suspense } from "react";

import { AddDAppModal } from "@/app/components/Modals/AddDAppModal";
import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { PreviewProtocolModal } from "@/app/components/Modals/PreviewProtocolModal";
import { UpdateDAppModal } from "@/app/components/Modals/UpdateDAppModal";
import { useError } from "@/app/context/Error/ErrorContext";

export const ProtocolsPageModalLayout: React.FC<{}> = ({}) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();

  return (
    <Suspense>
      <ConnectModal />
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        errorTime={error.errorTime}
        onClose={hideError}
        onRetry={retryErrorAction}
      />
      <UpdateDAppModal />
      <PreviewProtocolModal />
      <AddDAppModal />
    </Suspense>
  );
};
