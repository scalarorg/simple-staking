"use client";

import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import dynamic from "next/dynamic";

import { TermsProvider } from "./context/Terms/TermsContext";
import { GlobalParamsProvider } from "./context/api/GlobalParamsProvider";
import { StakingStatsProvider } from "./context/api/StakingStatsProvider";
import { BtcHeightProvider } from "./context/mempool/BtcHeightProvider";

const WalletProviderDynamic = dynamic(
  async () => await import("./context/WalletProvider"),
  {
    ssr: false,
  },
);

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TermsProvider>
      <WalletProviderDynamic>
        <GlobalParamsProvider>
          <BtcHeightProvider>
            <StakingStatsProvider>
              <ReactQueryStreamedHydration>
                {children}
              </ReactQueryStreamedHydration>
            </StakingStatsProvider>
          </BtcHeightProvider>
        </GlobalParamsProvider>
      </WalletProviderDynamic>
    </TermsProvider>
  );
}
