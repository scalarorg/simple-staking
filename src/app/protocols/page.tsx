"use client";

import Image from "next/image";

import earth from "@/app/assets/earth.webp";

interface ProtocolsProps {}

const Protocols: React.FC<ProtocolsProps> = () => {
  return (
    <main className="min-h-screen space-y-20">
      <Image
        className={
          "absolute -z-10 -right-[9%] top-[70vh] grayscale-[100%] brightness-75"
        }
        alt={"earth"}
        src={earth}
        priority
      />
      {/* <ManageProtocols /> */}
      {/* <ProtocolsPageModalLayout /> */}
    </main>
  );
};

export default Protocols;
