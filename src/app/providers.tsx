"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import React from "react";
import { WagmiProvider } from "wagmi";

import { ErrorProvider } from "./context/Error/ErrorContext";
import NetworkProvicer from "./context/NetworkProvicer";
import { getConfig } from "./wagmi";
import { ClientWrapper } from "./wrapper";

function Providers({ children }: React.PropsWithChildren) {
  const [config] = React.useState(getConfig());
  const [client] = React.useState(new QueryClient());

  return (
    <ThemeProvider defaultTheme="dark" attribute="data-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <NetworkProvicer>
            <ErrorProvider>
              <ClientWrapper>{children}</ClientWrapper>
            </ErrorProvider>
          </NetworkProvicer>
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
