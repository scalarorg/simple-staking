"use client";

import { Suspense } from "react";

import { AddCustodianGroupModal } from "@/app/components/Modals/AddCustodianGroupModal";
import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { UpdateCustodianGroupModal } from "@/app/components/Modals/UpdateCustodianGroupModal";
import { useError } from "@/app/context/Error/ErrorContext";

export const CustodianGroupsPageModalLayout: React.FC<{}> = ({}) => {
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
      <AddCustodianGroupModal />
      <UpdateCustodianGroupModal />
    </Suspense>
  );
};
