import { BookOpen } from "lucide-react";
import { LiquidityModel, ProtocolStatus } from "scalarjs-sdk/dist/types";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles } from "@/app/scalar/theme";
import { useProtocolModal } from "@/app/stores/modal";
import { Protocol } from "@/app/types/protocol";

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

  const isCustodian = protocol.attribute?.model === LiquidityModel.POOLING;

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
      {/* <td className="p-4">
        {protocol.custodian_group.TaprootAddress.slice(0, 8)}...
        {protocol.custodian_group.TaprootAddress.slice(-4)}
      </td> */}
      <td className="p-4">{ProtocolStatus[protocol.status]}</td>
      <td className="p-4">{isCustodian ? "Yes" : "No"}</td>
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
            Edit
            <BookOpen size={12} />
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteProtocolModal({ name: protocol.name });
            }}
            className={`px-2 bg-red-500 text-white hover:bg-red-700 rounded-lg flex items-center gap-2 justify-center ${
              !address ? "opacity-50 pointer-events-none" : ""
            }`}
            disabled={!address}
          >
            Delete
            <Trash2 size={12} />
          </button> */}
        </div>
      </td>
    </tr>
  );
};
