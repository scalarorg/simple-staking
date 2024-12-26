"use client";

import { Footer } from "@/app/components/Footer/Footer";
import { ProtocolHeader } from "@/app/components/Header/ProtocolHeader";

export default function CustodianGroupsLayout({
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
