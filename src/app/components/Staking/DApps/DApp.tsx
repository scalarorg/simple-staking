import { Coins, PencilIcon } from "lucide-react";
import { Tooltip } from "react-tooltip";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import { useDAppModal, useMintTxModal } from "@/app/stores/modal";
import { DApp as DAppInterface } from "@/app/types/dApps";

interface DAppProps {
  index: number;
  dApp: DAppInterface;
  onClick: () => void;
  selected: boolean;
}
export const DApp: React.FC<DAppProps> = ({
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
        {dApp.btcAddress.slice(0, 12)}...{dApp.btcAddress.slice(-8)}
      </td>
      <td className="p-4">
        {dApp.btcPk.slice(0, 20)}...{dApp.btcPk.slice(-20)}
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
            className={`px-2 hover:text-orange-600 flex items-center gap-2 justify-center ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={openMintTxModal}
            disabled={!address}
          >
            Mint
            <Coins size={12} />
          </button>
        </div>
        <Tooltip id={`tooltip-delegation-${dApp.btcPk}`} />
      </td>
    </tr>
  );
};
