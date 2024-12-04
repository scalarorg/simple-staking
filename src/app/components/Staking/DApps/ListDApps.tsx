import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { LoadingView } from "@/app/components/Loading/Loading";
import { useError } from "@/app/context/Error/ErrorContext";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpTableStyles } from "@/app/scalar/theme";
import { useAddDAppModal } from "@/app/stores/modal";
import { DApp } from "@/app/types/dApps";
import { ErrorState } from "@/app/types/errors";

import { useScalarClient } from "@/app/context/ScalarProvider";
import { DAppItem } from "./DAppItem";

// Staking form finality providers
export const ListDApps: React.FC<{}> = ({}) => {
  const { isErrorOpen, showError } = useError();
  const [selectedDApp, setSelectedDApp] = useState<DApp | undefined>(undefined);
  const { open: openAddDAppModal } = useAddDAppModal();
  const { address } = useWalletInfo();
  const { client: scalarClient } = useScalarClient();

  const {
    data,
    isLoading,
    error: dAppsError,
    isError: hasDAppsError,
    refetch: refetchDApps,
  } = useQuery({
    queryKey: ["getListDApps"],
    queryFn: () => scalarClient.getDAppsFromScalar(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    if (hasDAppsError && dAppsError) {
      showError({
        error: {
          message: dAppsError.message,
          errorState: ErrorState.SERVER_ERROR,
          errorTime: new Date(),
        },
        retryAction: refetchDApps,
      });
    }
  }, [hasDAppsError, dAppsError, showError, refetchDApps]);

  // If there are no dApps, show loading
  if (isLoading) {
    return <LoadingView />;
  }

  if (!data?.dApps) {
    return <div>No dApps found</div>;
  }

  return (
    <div className="flex flex-col gap-4 container mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">List of DApps</h1>
        <button
          className={`bg-orange-500 px-4 py-2 rounded-lg my-4 hover:bg-orange-600 transition-all duration-150 ${
            !address ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => openAddDAppModal()}
          disabled={!address}
        >
          Add
        </button>
      </div>
      <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
        <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-4 w-12">No</th>
                <th className="p-4 w-[200px]">Chain Name</th>
                <th className="p-4 w-[150px]">Token</th>
                <th className="p-4">BTC Address</th>
                <th className="p-4">Smart Contract Address</th>
                <th className="p-4 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.dApps?.map((da, index) => (
                <DAppItem
                  index={index}
                  key={da.id}
                  dApp={da}
                  onClick={() => setSelectedDApp(da)}
                  selected={selectedDApp?.id === da.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
