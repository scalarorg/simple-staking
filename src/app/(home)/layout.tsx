"use client";

import { Footer } from "@/app/components/Footer/Footer";
import { Header } from "@/app/components/Header/Header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-24">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
