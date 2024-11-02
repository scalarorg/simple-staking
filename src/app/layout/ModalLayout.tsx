"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { ConnectModal } from "../components/Modals/ConnectModal";
import { ErrorModal } from "../components/Modals/ErrorModal";
import { useError } from "../context/Error/ErrorContext";
import VaultProviderDynamic from "../context/VaultContext";
import { DApp } from "../types/dApps";

const MintTxModalDynamic = dynamic(
  () => import("../components/Modals/MintTxModal"),
  {
    ssr: false,
    loading: () => <div>Loading MintTxModal...</div>,
  },
);

export const ModalLayout: React.FC<{ dApp?: DApp }> = ({ dApp }) => {
  const { isErrorOpen, error, hideError, retryErrorAction } = useError();

  return (
    <Suspense>
      <VaultProviderDynamic>
        <ConnectModal />
        {dApp && <MintTxModalDynamic dApp={dApp} />}
        <ErrorModal
          open={isErrorOpen}
          errorMessage={error.message}
          errorState={error.errorState}
          errorTime={error.errorTime}
          onClose={hideError}
          onRetry={retryErrorAction}
        />
      </VaultProviderDynamic>
    </Suspense>
  );
};
