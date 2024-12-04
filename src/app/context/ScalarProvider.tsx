"use client";

import { ProjectENV } from "@/env";
import { ScalarClient } from "@/utils/scalar/client";
import { createContext, memo, useContext, useState } from "react";

const ScalarContext = createContext<{
  client: ScalarClient;
  setClient: (client: ScalarClient) => void;
} | null>(null);

export const useScalarClient = () => {
  const context = useContext(ScalarContext);
  if (!context) {
    throw new Error("useScalarClient must be used within a ScalarProvider");
  }
  return context;
};

const ScalarProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<ScalarClient>(
    () => new ScalarClient(ProjectENV.NEXT_PUBLIC_SCALAR_NODE_URL),
  );

  return (
    <ScalarContext.Provider
      value={{
        client,
        setClient,
      }}
    >
      {children}
    </ScalarContext.Provider>
  );
};

export default memo(ScalarProvider);
