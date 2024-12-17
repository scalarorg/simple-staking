"use client";

import Image from "next/image";

import earth from "@/app/assets/earth.webp";

import { ListBonds } from "./components/Bonds/ListBonds";
import { ListProtocols } from "./components/Staking/Protocols/ListProtocols";
import { Summary } from "./components/Summary/Summary";
import { ModalLayout } from "./layout/ModalLayout";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <main className="min-h-screen space-y-20">
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
      />
      <div className="container mx-auto flex justify-center py-6">
        <div className="container flex flex-col gap-6">
          <div
            className={
              "flex gap-4 items-end max-lg:flex-col-reverse max-lg:items-stretch"
            }
          >
            <div className={"space-y-2 flex-1"}>
              <h1 className={"text-3xl md:text-[34px] font-medium"}>
                BTC Staking
              </h1>
            </div>
          </div>
          <Summary />
        </div>
      </div>
      <ListProtocols />
      <ListBonds />
      <ModalLayout />
    </main>
  );
};

export default Home;
