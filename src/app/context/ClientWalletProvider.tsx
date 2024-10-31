"use client";

import dynamic from "next/dynamic";

const WalletProviderComponent = dynamic(
  () => import("./WalletProvider").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div>Loading wallet...</div>,
  },
);

export function ClientWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProviderComponent>{children}</WalletProviderComponent>;
}
