import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

import { Bond as TBond } from "@/app/types/bonds";

// interface BondProps {
//   finalityProviderMoniker: string;
//   stakingTx: StakingTx;
//   stakingValueSat: number;
//   stakingTxHash: string;
//   state: string;
//   onUnbond: (id: string) => void;
//   onWithdraw: (id: string) => void;
//   // This attribute is set when an action has been taken by the user
//   // that should change the status but the back-end
//   // has not had time to reflect this change yet
//   intermediateState?: string;
//   isOverflow: boolean;
//   globalParamsVersion: GlobalParamsVersion;
// }

export const Bond: React.FC<{
  data: TBond;
  index: number;
}> = ({ data, index }) => {
  // const { startTimestamp } = stakingTx;
  // const [currentTime, setCurrentTime] = useState(Date.now());
  // const [burnTokenModalOpen, setBurnTokenModalOpen] = useState(false);

  // useEffect(() => {
  //   const timerId = setInterval(() => {
  //     setCurrentTime(Date.now());
  //   }, 60000); // set the refresh interval to 60 seconds

  //   return () => clearInterval(timerId);
  // }, []);

  // const generateActionButton = () => {
  //   // This function generates the unbond or withdraw button
  //   // based on the state of the bond
  //   // It also disables the button if the bond
  //   // is in an intermediate state (local storage)
  //   if (state === BondState.ACTIVE) {
  //     return (
  //       <div className="flex justify-end lg:justify-start">
  //         <button
  //           className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
  //           onClick={() => onUnbond(stakingTxHash)}
  //           disabled={intermediateState === BondState.INTERMEDIATE_UNBONDING}
  //         >
  //           Unbond
  //         </button>
  //       </div>
  //     );
  //   } else if (state === BondState.UNBONDED) {
  //     return (
  //       <div className="flex justify-end lg:justify-start">
  //         <button
  //           className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
  //           onClick={() => onWithdraw(stakingTxHash)}
  //           disabled={intermediateState === BondState.INTERMEDIATE_WITHDRAWAL}
  //         >
  //           Withdraw
  //         </button>
  //       </div>
  //     );
  //   } else {
  //     return null;
  //   }
  // };

  // const isActive =
  //   intermediateState === BondState.ACTIVE || state === BondState.ACTIVE;

  // const renderState = () => {
  //   // overflow should be shown only on active state
  //   if (isOverflow && isActive) {
  //     return getState(BondState.OVERFLOW);
  //   } else {
  //     return getState(intermediateState || state);
  //   }
  // };

  // const renderStateTooltip = () => {
  //   // overflow should be shown only on active state
  //   if (isOverflow && isActive) {
  //     return getStateTooltip(BondState.OVERFLOW, globalParamsVersion);
  //   } else {
  //     return getStateTooltip(intermediateState || state, globalParamsVersion);
  //   }
  // };

  // const { coinName, mempoolApiUrl } = getNetworkConfig();

  // id: string;
  // status: string;
  // simplifiedStatus: string;
  // sourceChain: string;
  // sourceTxHash: string;
  // sourceTxHex: string;
  // destinationChain: string;
  // destinationSmartContractAddress: string;
  // stakerPubkey: string;
  // amount: string;
  // createdAt: number;
  // updatedAt: number;

  return (
    <div className="grid-cols-9 gap-12 px-4 lg:grid items-center divide-y divide-white">
      <div>{index}</div>
      <Link
        href="https://blockstream.info/tx/{data.sourceTxHash}"
        className="flex items-center gap-2"
      >
        <LinkIcon />
        {data.sourceTxHash.slice(0, 4)}...{data.sourceTxHash.slice(-4)}
      </Link>
      <div>{data.simplifiedStatus}</div>
      <div>{data.sourceChain}</div>
      <div>{data.destinationChain}</div>
      <div>{data.destinationSmartContractAddress}</div>
      <div>{data.amount}</div>
      <div>{data.createdAt}</div>
    </div>
  );
};

// <BurnTokenModal
//   open={burnTokenModalOpen}
//   onClose={setBurnTokenModalOpen}
//   btcAddress={address}
//   signPsbt={signPsbt}
//   stakingTxHex={stakingTx.txHex}
// />
