import { LoadingView } from "@/app/components/Loading/Loading";
import { Bond as BondInterface } from "@/app/types/bonds";

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
          {Bonds?.map((bond, idx) => <></>)}
        </div>
      </div>
    </>
  );
};
