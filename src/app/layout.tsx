import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";

import stone from "@/app/assets/stone.webp";
import { Toaster } from "@/app/components/ui/toaster";
import { ProjectENV } from "@/env";

import Providers from "./providers";

import "react-responsive-modal/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Staking Dashboard",
  description: "BTC Staking Dashboard",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Scalar - Staking Dashboard",
    description: "BTC Staking Dashboard",
    images: [
      {
        url: new URL("og.png", ProjectENV.NEXT_PUBLIC_APP_URL),
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BTC Staking Dashboard",
    description: "BTC Staking Dashboard",
    images: [
      {
        url: new URL("og.png", ProjectENV.NEXT_PUBLIC_APP_URL),
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="overflow-hidden relative h-full min-h-svh z-0 w-full">
          <div className={"absolute -z-10 left-[9%] top-[5%]"}>
            <div className="absolute h-full bottom-1/2 left-1/2 -translate-x-1/2 aspect-square rounded-full bg-[radial-gradient(37.54%_37.54%_at_50.07%_47.01%,rgba(3,185,216,0.30)_0%,rgba(36,93,137,0.00)_100%)]" />
            <Image alt={"stone"} src={stone} priority />
            <div
              className={
                "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 h-[90%] opacity-[16%] aspect-square rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#F9B55F_0%,rgba(249,181,95,0.00)_100%)] mix-blend-screen blur-[150px]"
              }
            />
            <div
              className={
                "absolute rounded-full h-[200%] aspect-square bg-[radial-gradient(50%_50%_at_50%_50%,#D9D9D9_0%,rgba(217,217,217,0.00)_100%)] top-1/2 -translate-y-1/2 right-1/2 opacity-[30%] mix-blend-hard-light blur-[100px]"
              }
            />
          </div>
          <Providers>{children}</Providers>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
