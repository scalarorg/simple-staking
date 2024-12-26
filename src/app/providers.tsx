"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ThemeProvider } from "next-themes";
import React from "react";
import { WagmiProvider } from "wagmi";

import { CosmosWalletProvider } from "@/app/context/CosmosWalletProvider";
import { ErrorProvider } from "@/app/context/Error/ErrorContext";
import NetworkProvicer from "@/app/context/NetworkProvicer";
import ScalarProvider from "@/app/context/ScalarProvider";
import { TermsProvider } from "@/app/context/Terms/TermsContext";
import VaultProvider from "@/app/context/VaultContext";
import WalletProvider from "@/app/context/WalletProvider";
import { getConfig } from "@/app/wagmi";

function Providers({ children }: React.PropsWithChildren) {
  const [config] = React.useState(getConfig());
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <ErrorProvider>
            <NetworkProvicer>
              <ScalarProvider>
                <TermsProvider>
                  <WalletProvider>
                    <CosmosWalletProvider>
                      <VaultProvider>
                        <ReactQueryStreamedHydration>
                          {children}
                        </ReactQueryStreamedHydration>
                      </VaultProvider>
                    </CosmosWalletProvider>
                  </WalletProvider>
                </TermsProvider>
              </ScalarProvider>
            </NetworkProvicer>
          </ErrorProvider>
          <ReactQueryDevtools
            buttonPosition="bottom-left"
            initialIsOpen={false}
          />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default Providers;
