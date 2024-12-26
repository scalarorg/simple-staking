import { XIcon } from "lucide-react";

import { GeneralModal } from "@/app/components/Modals/GeneralModal";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useDeleteProtocolModal } from "@/app/stores/modal";
import { DeleteProtocolRequest } from "@/app/types/protocol";

export const DeleteProtocolModal: React.FC<{}> = ({}) => {
  const { protocolData, isOpen, close } = useDeleteProtocolModal();

  const scalarClient = useScalarClient();

  const handleDeleteProtocol = async () => {
    if (!protocolData) return;

    const deleteProtocolRequest: DeleteProtocolRequest = {
      name: protocolData.name,
    };

    await scalarClient.client.deleteProtocol(deleteProtocolRequest);

    console.log("Successfully deleted protocol", deleteProtocolRequest);
  };

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Delete Protocol</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-white">
          Are you sure you want to delete protocol
          <span className="font-semibold">{protocolData?.name}</span>?
        </p>
        <p className="mt-2 text-sm text-gray-500">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={() => close()}>
          Cancel
        </button>
        <button
          className="btn btn-error"
          onClick={() => {
            handleDeleteProtocol();
            close();
          }}
        >
          Delete
        </button>
      </div>
    </GeneralModal>
  );
};
