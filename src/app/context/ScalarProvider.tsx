"use client";

import { createContext, memo, useMemo } from "react";

import { useError } from "@/app/context/Error/ErrorContext";
import { ProjectENV } from "@/env";
import { ScalarClient } from "@/utils/scalar/client";

interface ScalarContextType {
  client: ScalarClient;
  // // dApps: {
  // //   data: any;
  // //   isLoading: boolean;
  // //   error: Error | null;
  // //   refetch: () => void;
  // // };
  // protocols: {
  //   data: { protocols: Protocol[] } | undefined;
  //   isLoading: boolean;
  //   error: Error | null;
  //   refetch: () => void;
  // };
}

const ScalarContext = createContext<ScalarContextType | undefined>(undefined);

export function ScalarProvider({ children }: { children: React.ReactNode }) {
  const { isErrorOpen, showError } = useError();
  const client = useMemo(() => {
    return new ScalarClient(ProjectENV.NEXT_PUBLIC_SCALAR_GRPC_URL);
  }, []);

  // const dAppsQuery = useQuery({
  //   queryKey: ["getListDApps"],
  //   queryFn: () => client.getDAppsFromScalar(),
  //   refetchInterval: 60000, // 1 minute
  //   retry: (failureCount, error) => {
  //     return !isErrorOpen && failureCount <= 3;
  //   },
  // });

  // const protocolsQuery = useQuery({
  //   queryKey: ["getListProtocols"],
  //   queryFn: () => client.getProtocols(),
  //   refetchInterval: 60000, // 1 minute
  //   retry: (failureCount, error) => {
  //     return !isErrorOpen && failureCount <= 3;
  //   },
  // });

  // useEffect(() => {
  //   if (dAppsQuery.isError && dAppsQuery.error) {
  //     showError({
  //       error: {
  //         message: dAppsQuery.error.message,
  //         errorState: ErrorState.SERVER_ERROR,
  //         errorTime: new Date(),
  //       },
  //       retryAction: dAppsQuery.refetch,
  //     });
  //   }
  // }, [dAppsQuery.isError, dAppsQuery.error, showError]);

  // useEffect(() => {
  //   if (protocolsQuery.isError && protocolsQuery.error) {
  //     showError({
  //       error: {
  //         message: protocolsQuery.error.message,
  //         errorState: ErrorState.SERVER_ERROR,
  //         errorTime: new Date(),
  //       },
  //     });
  //   }
  // }, [protocolsQuery.isError, protocolsQuery.error, showError]);

  const value = {
    client,
    // dApps: {
    //   data: dAppsQuery.data,
    //   isLoading: dAppsQuery.isLoading,
    //   error: dAppsQuery.error,
    //   refetch: dAppsQuery.refetch,
    // },
    // protocols: {
    //   data: protocolsQuery.data,
    //   isLoading: protocolsQuery.isLoading,
    //   error: protocolsQuery.error,
    //   refetch: protocolsQuery.refetch,
    // },
  };

  return (
    <ScalarContext.Provider value={value}>{children}</ScalarContext.Provider>
  );
}

export default memo(ScalarProvider);
