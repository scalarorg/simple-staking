import {
  CircleArrowDown,
  CircleArrowUp,
  Coins,
  PencilIcon,
} from "lucide-react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

import SBTC_ABI from "@/abis/sbtc";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useERC20Contract } from "@/app/hooks/useContracts";
import { fpStyles } from "@/app/scalar/theme";
import {
  useDAppModal,
  useMintTxModal,
  useStakeCustodialModal,
  useUnstakeCustodialModal,
} from "@/app/stores/modal";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { useAccount } from "wagmi";

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
  const [isCustodial, setIsCustodial] = useState(false);

  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = dApp.chainName;
  const { open } = useDAppModal();
  const { address } = useWalletInfo();
  const { address: evmAddress } = useAccount();
  const { open: openMintTxModal } = useMintTxModal();
  const { open: openStakeCustodialModal } = useStakeCustodialModal();
  const { open: openUnstakeCustodialModal } = useUnstakeCustodialModal();
  const { tokenName } = useERC20Contract(
    SBTC_ABI,
    dApp.tokenContractAddress,
    evmAddress,
    dApp.scAddress,
  );

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
      <td className="p-4">{tokenName?.toString() || "-"}</td>
      <td className="p-4">
        {dApp.btcAddress.slice(0, 8)}...{dApp.btcAddress.slice(-4)}
      </td>
      <td className="p-4">
        {dApp.btcPk.slice(0, 10)}...{dApp.btcPk.slice(-4)}
      </td>
      <td className="p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCustodial(!isCustodial);
          }}
          className={`px-3 py-1 rounded-full transition-colors ${
            isCustodial ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          {isCustodial ? "On" : "Off"}
        </button>
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
          {!isCustodial && (
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
          )}
          {isCustodial && (
            <>
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
            </>
          )}
        </div>
        <Tooltip id={`tooltip-delegation-${dApp.btcPk}`} />
      </td>
    </tr>
  );
};
