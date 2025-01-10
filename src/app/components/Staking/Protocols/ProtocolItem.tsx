import { ArrowLeftRight, BookOpen, CircleArrowDown } from "lucide-react";
// import { Tooltip } from "react-tooltip";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import {
  useMintTxModal,
  useProtocolModal,
  useTransferModal,
} from "@/app/stores/modal";
import { decodeScalarBytesToString } from "@/utils/scalar/decode";

interface ProtocolProps {
  index: number;
  protocol: TProtocol;
}

export const ProtocolItem: React.FC<ProtocolProps> = ({ protocol, index }) => {
  const isCustodian = protocol.attribute?.model === "LIQUIDITY_MODEL_POOLING";

  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = protocol.name;
  const { open } = useProtocolModal();
  const { address } = useWalletInfo();
  const { address: evmAddress, connector } = useAccount();
  const { open: openMintTxModal } = useMintTxModal();
  const { open: openTransferModal } = useTransferModal();
  const { connect } = useConnect();

  useEffect(() => {
    if (!evmAddress && connector) {
      connect({ connector });
    }
  }, [evmAddress, connect, connector]);

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
      <td className="p-4">
        {protocol.tag ? decodeScalarBytesToString(protocol.tag) : ""}
      </td>
      <td className="p-4">{isCustodian ? "Pooling" : "Transactional"}</td>
      <td className="p-4">{protocol.status?.replace(/^STATUS_/, "")}</td>
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
                className={`px-2 hover:text-yellow-300 flex items-center gap-2 justify-center text-[#f8c200] ${
                  !address ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => openTransferModal(protocol)}
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
