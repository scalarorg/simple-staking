import { XIcon } from "lucide-react";

import { GeneralModal } from "../GeneralModal";

import { CustodianOnlyTransferModal } from "./CustodianOnlyTransfer";
import { UPCTransferModal } from "./UPCTransfer";

export const BaseTransferModal = ({
  protocol,
  close,
}: {
  protocol: TProtocol;
  close: () => void;
}) => {
  if (!protocol || !protocol.attribute) {
    throw new Error("Protocol or protocol attribute is undefined");
  }

  const type = protocol.attribute.model;

  return (
    <GeneralModal open={true} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">
          Transfer token{""}
          <span className="ml-2 text-orange-500 font-bold text-xl">
            ${protocol.asset?.name}
          </span>
        </h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <XIcon size={24} />
        </button>
      </div>
      {(() => {
        if (type === "LIQUIDITY_MODEL_POOLING") {
          return <CustodianOnlyTransferModal protocol={protocol} />;
        } else if (type === "LIQUIDITY_MODEL_TRANSACTIONAL") {
          return <UPCTransferModal protocol={protocol} />;
        }
      })()}
    </GeneralModal>
  );
};
