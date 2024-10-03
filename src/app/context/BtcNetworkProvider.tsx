import { usePathname } from "next/navigation";
import React, { ReactNode, createContext, useContext } from "react";

import { parseENV } from "@/env";

interface BtcNetworkProviderProps {
  children: ReactNode;
}

interface BtcNetworkContextType {
  btcNetwork: string | undefined;
  setBtcNetwork: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const defaultContextValue: BtcNetworkContextType = {
  btcNetwork: undefined,
  setBtcNetwork: () => {},
};

const BtcNetworkContext =
  createContext<BtcNetworkContextType>(defaultContextValue);

function btcNetworkNameOfPath(pathname: string): string {
  const nameFromPath = pathname.replace(/^\/([^/]*).*/, "$1");
  const ProjectENV = parseENV();
  const networkNames = ProjectENV.NEXT_PUBLIC_BTC_NETWORK_LIST;
  if (networkNames.includes(nameFromPath)) {
    return nameFromPath;
  } else {
    return "Mainnet";
  }
}

export const BtcNetworkProvider: React.FC<BtcNetworkProviderProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const btcNetworkName = btcNetworkNameOfPath(pathname);
  const [btcNetwork, setBtcNetwork] = React.useState<string | undefined>(
    btcNetworkName,
  );

  return (
    <BtcNetworkContext.Provider value={{ btcNetwork, setBtcNetwork }}>
      {children}
    </BtcNetworkContext.Provider>
  );
};

export const useBtcNetwork = () => useContext(BtcNetworkContext);
