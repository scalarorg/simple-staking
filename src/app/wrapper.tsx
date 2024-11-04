"use client";

import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

import { ErrorProvider } from "./context/Error/ErrorContext";
import NetworkProvicer from "./context/NetworkProvicer";
import { TermsProvider } from "./context/Terms/TermsContext";
import WalletProvider from "./context/WalletProvider";
import { AppLayout } from "./layout/AppLayout";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorProvider>
      <NetworkProvicer>
        <TermsProvider>
          <WalletProvider>
            <ReactQueryStreamedHydration>
              <AppLayout>{children}</AppLayout>
            </ReactQueryStreamedHydration>
          </WalletProvider>
        </TermsProvider>
      </NetworkProvicer>
    </ErrorProvider>
  );
}
