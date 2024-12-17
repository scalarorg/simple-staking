"use client";

import { Footer } from "@/app/components/Footer/Footer";
import { ProtocolHeader } from "@/app/components/Header/ProtocolHeader";

export default function ProtocolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-24">
      <ProtocolHeader />
      {children}
      <Footer />
    </div>
  );
}
