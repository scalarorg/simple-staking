"use client";

import { Suspense } from "react";

import { AddDestinationChainModal } from "@/app/components/Modals/AddDestinationChainModal";
import { AddProtocolModal } from "@/app/components/Modals/AddProtocolModal";
import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { DeleteProtocolModal } from "@/app/components/Modals/DeleteProtocolModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { UpdateProtocolModal } from "@/app/components/Modals/UpdateProtocolModal";
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
      <UpdateProtocolModal />
      <AddProtocolModal />
      <DeleteProtocolModal />
      <AddDestinationChainModal />
    </Suspense>
  );
};
