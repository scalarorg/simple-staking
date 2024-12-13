import { CircleArrowDown, CircleArrowUp, PencilIcon } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";

import SBTC_ABI from "@/abis/sbtc";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useERC20Contract } from "@/app/hooks/useContracts";
import { fpStyles } from "@/app/scalar/theme";
import {
  useDAppModal,
  useMintTxModal,
  useStakeCustodianModal,
  useUnstakeCustodianModal,
} from "@/app/stores/modal";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { hexStringWith0x } from "@/utils/trim";

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
  console.log("--- dapp.chainId", dApp.chainId);
  const { client: scalarClient } = useScalarClient();
  const isCustodian = scalarClient.isCustodianDApp(
    hexStringWith0x(dApp.scAddress),
  );

  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = dApp.chainName;
  const { open } = useDAppModal();
  const { address } = useWalletInfo();
  const { address: evmAddress } = useAccount();
  const { open: openMintTxModal } = useMintTxModal();
  const { open: openStakeCustodianModal } = useStakeCustodianModal();
  const { open: openUnstakeCustodianModal } = useUnstakeCustodianModal();
  const { tokenSymbol } = useERC20Contract(
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
      <td className="p-4">{tokenSymbol?.toString() || "-"}</td>
      <td className="p-4">
        {dApp.btcAddress.slice(0, 8)}...{dApp.btcAddress.slice(-4)}
      </td>
      <td className="p-4">
        {dApp.scAddress.slice(0, 10)}...{dApp.scAddress.slice(-4)}
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
          {!isCustodian && (
            <button
              className={`px-2 hover:text-green-600 flex items-center gap-2 justify-center text-green-700 ${
                !address ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => openMintTxModal(dApp)}
              disabled={!address}
            >
              Stake
              <CircleArrowDown size={16} />
            </button>
          )}
          {isCustodian && (
            <>
              <button
                className={`px-2 hover:text-green-600 flex items-center gap-2 justify-center text-green-700 ${
                  !address ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => openStakeCustodianModal(dApp)}
                disabled={!address}
              >
                Stake
                <CircleArrowDown size={16} />
              </button>
              <button
                className={`px-2 hover:text-cyan-600 flex items-center gap-2 justify-center text-cyan-700 ${
                  !address ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => openUnstakeCustodianModal(dApp)}
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
