"use client";

import { Suspense } from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
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
      {/* <UpdateProtocolModal />
      <AddProtocolModal />
      <DeleteProtocolModal />
      <AddDestinationChainModal /> */}
    </Suspense>
  );
};
