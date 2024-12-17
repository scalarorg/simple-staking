import { BookOpen } from "lucide-react";
import { Tooltip } from "react-tooltip";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import { useProtocolModal } from "@/app/stores/modal";
import { Protocol, ProtocolStatus } from "@/app/types/protocol";

interface ManageProtocolProps {
  index: number;
  protocol: Protocol;
}
export const ManageProtocolsItem: React.FC<ManageProtocolProps> = ({
  protocol,
  index,
}) => {
  const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

  const dAppHasData = protocol.name;
  const { open } = useProtocolModal();
  const { address } = useWalletInfo();

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
      <td className="p-4">
        {protocol.custodian_group.TaprootAddress.slice(0, 8)}...
        {protocol.custodian_group.TaprootAddress.slice(-4)}
      </td>
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
        </div>
        <Tooltip
          id={`tooltip-delegation-${protocol.btc_chain.btc_signer_pk}`}
        />
      </td>
    </tr>
  );
};
