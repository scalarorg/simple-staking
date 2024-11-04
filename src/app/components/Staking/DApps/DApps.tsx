import { LoadingView } from "@/app/components/Loading/Loading";
import { DApp as DAppInterface } from "@/app/types/dApps";

import { DApp } from "./DApp";

interface DAppsProps {
  dApps: DAppInterface[] | undefined;
  selectedDApp: DAppInterface | undefined;
  isLoading: boolean;
  // called when the user selects a dApp
  onDAppChange: (btcPkHex: string) => void;
}

// Staking form finality providers
export const DApps: React.FC<DAppsProps> = ({
  dApps,
  selectedDApp,
  isLoading = true,
  onDAppChange,
}) => {
  // If there are no dApps, show loading
  if (isLoading) {
    return <LoadingView />;
  }

  if (!dApps) {
    return <div>No dApps found</div>;
  }

  return (
    <>
      <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-4">No</th>
              <th className="p-4">Chain Name</th>
              <th className="p-4">BTC Address</th>
              <th className="p-4">BTC Pubkey</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dApps?.map((da, index) => (
              <DApp
                index={index}
                key={da.id}
                dApp={da}
                onClick={() => onDAppChange(da.id)}
                selected={selectedDApp?.id === da.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
