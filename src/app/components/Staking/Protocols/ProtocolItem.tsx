import { ArrowLeftRight, BookOpen, CircleArrowDown } from "lucide-react";
// import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";
import { LiquidityModel, ProtocolStatus } from "scalarjs-sdk/dist/types";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import {
  useMintTxModal,
  useProtocolModal,
  useStakeCustodianModal,
  useUnstakeCustodianModal,
} from "@/app/stores/modal";
import { Protocol } from "@/app/types/protocol";

interface ProtocolProps {
  index: number;
  protocol: Protocol;
}

export const ProtocolItem: React.FC<ProtocolProps> = ({ protocol, index }) => {
  const isCustodian = protocol.attribute?.model === LiquidityModel.POOLING;

  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = protocol.name;
  const { open } = useProtocolModal();
  const { address } = useWalletInfo();
  const { address: evmAddress } = useAccount();
  const { open: openMintTxModal } = useMintTxModal();
  const { open: openStakeCustodianModal } = useStakeCustodianModal();
  const { open: openUnstakeCustodianModal } = useUnstakeCustodianModal();

  return (
    <tr
      className={`
        ${generalStyles}
        ${dAppHasData ? "" : "opacity-50 pointer-events-none"}
        ${fpStyles}
        `}
    >
      <td className="p-4">{index + 1}</td>
      <td className="p-4">{protocol.name}</td>
      <td className="p-4">{protocol.service_tag}</td>
      <td className="p-4">{isCustodian ? "Pooling" : "Transactional"}</td>
      <td className="p-4">{ProtocolStatus[protocol.status]}</td>
      <td className="p-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              open(protocol);
            }}
            className={`px-2 hover:text-orange-600 flex items-center gap-2 justify-center ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            disabled={!address}
          >
            Preview
            <BookOpen size={12} />
          </button>
          {!isCustodian && (
            <button
              className={`px-2 hover:text-red-600 flex items-center gap-2 justify-center text-red-700 ${
                !address ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => openMintTxModal(protocol)}
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
                onClick={() => openStakeCustodianModal(protocol)}
                disabled={!address}
              >
                Transfer
                <ArrowLeftRight size={16} />
              </button>
              {/* <button
                className={`px-2 hover:text-cyan-600 flex items-center gap-2 justify-center text-cyan-700 ${
                  !address ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => openUnstakeCustodianModal(protocol)}
                disabled={!address}
              >
                Unstake
                <CircleArrowUp size={16} />
              </button> */}
            </>
          )}
        </div>
        {/* <Tooltip
          id={`tooltip-delegation-${protocol.btc_chain.btc_signer_pk}`}
        /> */}
      </td>
    </tr>
  );
};
