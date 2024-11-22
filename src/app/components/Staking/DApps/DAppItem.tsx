import {
  CircleArrowDown,
  CircleArrowUp,
  Coins,
  PencilIcon,
} from "lucide-react";
import { Tooltip } from "react-tooltip";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import {
  useDAppModal,
  useMintTxModal,
  useStakeCustodialModal,
  useUnstakeCustodialModal,
} from "@/app/stores/modal";
import { DApp as DAppInterface } from "@/app/types/dApps";

interface DAppProps {
  index: number;
  dApp: DAppInterface;
  onClick: () => void;
  selected: boolean;
}
export const DAppItem: React.FC<DAppProps> = ({
  dApp,
  onClick,
  selected,
  index,
}) => {
  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = dApp.chainName;
  const { open } = useDAppModal();
  const { address } = useWalletInfo();
  const { open: openMintTxModal } = useMintTxModal();
  const { open: openStakeCustodialModal } = useStakeCustodialModal();
  const { open: openUnstakeCustodialModal } = useUnstakeCustodialModal();

  return (
    <tr
      className={`
        ${generalStyles}
        ${selected ? "fp-selected" : ""}
        ${dAppHasData ? "" : "opacity-50 pointer-events-none"}
        ${fpStyles}
        `}
      onClick={onClick}
    >
      <td className="p-4">{index + 1}</td>
      <td className="p-4">{dApp.chainName}</td>
      <td className="p-4">
        {dApp.btcAddress.slice(0, 12)}...{dApp.btcAddress.slice(-4)}
      </td>
      <td className="p-4">
        {dApp.btcPk.slice(0, 20)}...{dApp.btcPk.slice(-4)}
      </td>
      <td className="p-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              open(dApp);
            }}
            className={`px-2 hover:text-orange-600 flex items-center gap-2 justify-center ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            disabled={!address}
          >
            Edit
            <PencilIcon size={12} />
          </button>
          <button
            className={`px-2 hover:text-orange-600 flex items-center gap-2 justify-center text-orange-700 ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => openMintTxModal(dApp)}
            disabled={!address}
          >
            Mint
            <Coins size={12} />
          </button>
          <button
            className={`px-2 hover:text-green-600 flex items-center gap-2 justify-center text-green-700 ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => openStakeCustodialModal(dApp)}
            disabled={!address}
          >
            Stake
            <CircleArrowDown size={16} />
          </button>
          <button
            className={`px-2 hover:text-cyan-600 flex items-center gap-2 justify-center text-cyan-700 ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => openUnstakeCustodialModal(dApp)}
            disabled={!address}
          >
            Unstake
            <CircleArrowUp size={16} />
          </button>
        </div>
        <Tooltip id={`tooltip-delegation-${dApp.btcPk}`} />
      </td>
    </tr>
  );
};
