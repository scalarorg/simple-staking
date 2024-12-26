"use client";

import Image from "next/image";

import earth from "@/app/assets/earth.webp";
import { CustodianGroups } from "@/app/components/Staking/Protocols/CustodianGroups";
import { CustodianGroupsPageModalLayout } from "@/app/protocols/CustodianGroupsPageModalLayout";

import { Custodians } from "../components/Staking/Protocols/Custodians";

interface CustodianGroupsProps {}

const CustodianGroupsPage: React.FC<CustodianGroupsProps> = () => {
  return (
    <main className="min-h-screen space-y-20">
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
      />
      <CustodianGroups />
      <Custodians />
      <CustodianGroupsPageModalLayout />
    </main>
  );
};

export default CustodianGroupsPage;
