import { LoadingView } from "@/app/components/Loading/Loading";
import { Bond as BondInterface } from "@/app/types/Bonds";

import { Bond } from "./Bond";

interface BondsProps {
  Bonds: BondInterface[] | undefined;
  selectedBond: BondInterface | undefined;
  isLoading: boolean;
  // called when the user selects a dApp
  onBondChange: (btcPkHex: string) => void;
}

// Staking form finality providers
export const Bonds: React.FC<BondsProps> = ({
  Bonds,
  selectedBond,
  isLoading = true,
  onBondChange,
}) => {
  // If there are no Bonds, show loading
  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <>
      <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-6">
        <p>No</p>
        <p>Txhash</p>
        <p>Chain Name</p>
        <p>Smart Contract Address</p>
        <p>Amount</p>
        <p> </p>
      </div>
      <div
        id="finality-providers"
        className="no-scrollbar max-h-[21rem] overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          {Bonds?.map((bond, idx) => (
            <Bond
              key={idx}
              id={bond.id}
              no={(idx + 1).toString().padStart(3, "0")}
              txhash={bond.txhash}
              chainName={bond.chainName}
              smAddress={bond.smAddress}
              amount={bond.amount}
              onClick={() => onBondChange(bond.id)}
              selected={selectedBond?.id === bond.id}
            />
          ))}
        </div>
      </div>
    </>
  );
};
