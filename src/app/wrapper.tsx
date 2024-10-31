"use client";

import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { TermsProvider } from "./context/Terms/TermsContext";
import WalletProvider from "./context/WalletProvider";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TermsProvider>
      <WalletProvider>
        <GlobalParamsProvider>
          <BtcHeightProvider>
            <StakingStatsProvider>
              <ReactQueryStreamedHydration>
                {children}
              </ReactQueryStreamedHydration>
            </StakingStatsProvider>
          </BtcHeightProvider>
        </GlobalParamsProvider>
      </WalletProvider>
    </TermsProvider>
  );
}
