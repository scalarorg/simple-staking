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

  return (
    <>
      {/*<p>*/}
      {/*  Select a finality provider or{" "}*/}
      {/*  <a*/}
      {/*    href="https://github.com/babylonchain/networks/tree/main/bbn-test-4/finality-providers"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*    className="sublink text-primary hover:underline"*/}
      {/*  >*/}
      {/*    create your own*/}
      {/*  </a>*/}
      {/*  .*/}
      {/*</p>*/}
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingDAppDesktop">
        <p>ID</p>
        <p>Chain Name</p>
        <p>BTC Address</p>
        <p>BTC PK</p>
        <p>State</p>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          {dApps?.map((da) => (
            <DApp
              key={da.id}
              id={da.id}
              chainName={da.chainName}
              btcAddress={da.btcAddress}
              btcPk={da.btcPk}
              state={da.state}
              onClick={() => onDAppChange(da.id)}
              selected={selectedDApp?.id === da.id}
            />
          ))}
        </div>
      </div>
    </>
  );
};
