"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import React from "react";
import { WagmiProvider } from "wagmi";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

import { ErrorProvider } from "./context/Error/ErrorContext";
import NetworkProvicer from "./context/NetworkProvicer";
import { TermsProvider } from "./context/Terms/TermsContext";
import WalletProvider from "./context/WalletProvider";
import { AppLayout } from "./layout/AppLayout";
import { getConfig } from "./wagmi";

function Providers({ children }: React.PropsWithChildren) {
  const [config] = React.useState(getConfig());
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
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
