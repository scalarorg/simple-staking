import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { updateDApp } from "@/app/api/dApp";
import { DApp as DAppInterface } from "@/app/types/dApps";

import { BtcAddress } from "../Staking/Form/BtcAddress";
import { BtcPubKey } from "../Staking/Form/BtcPubkey";
import { ChainName } from "../Staking/Form/ChainName";

import { GeneralModal } from "./GeneralModal";

interface UpdateDAppModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  dApp: DAppInterface | undefined;
}

export const UpdateDAppModal: React.FC<UpdateDAppModalProps> = ({
  open,
  onClose,
  dApp,
}) => {
  const [chainName, setChainName] = useState(dApp?.chainName);
  const [btcAddress, setBtcAddress] = useState(dApp?.btcAddress);
  const [btcPubKey, setBtcPubKey] = useState(dApp?.btcPk);
  const [scAddress, setScAddress] = useState(dApp?.scAddress);
  const [id, setId] = useState(dApp?.id);
  useEffect(() => {
    setChainName(dApp?.chainName);
    setBtcAddress(dApp?.btcAddress);
    setBtcPubKey(dApp?.btcPk);
    setId(dApp?.id);
    setScAddress(dApp?.scAddress);
  }, [dApp]);

  const handleChainNameChange = (input: string) => {
    setChainName(input);
  };
  const handleBtcAddressChange = (input: string) => {
    setBtcAddress(input);
  };
  const handleBtcPubKeyChange = (input: string) => {
    setBtcPubKey(input);
  };

  const handleSmartContractAddressChange = (input: string) => {
    setScAddress(input);
  };

  const handleUpdate = async () => {
    if (!id || !chainName || !btcAddress || !btcPubKey || !scAddress) {
      console.error("Missing required fields");
      return;
    }
    await updateDApp(id, chainName, btcAddress, btcPubKey, scAddress)
      .then(() => {
        console.log("Successfully update DApp");
        onClose(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Edit DApp information!</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <ChainName
            onChange={handleChainNameChange}
            reset={false}
            initValue={chainName || ""}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={handleBtcAddressChange}
            reset={false}
            initValue={btcAddress || ""}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcPubKey
            onChange={handleBtcPubKeyChange}
            reset={false}
            initValue={btcPubKey || ""}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={handleSmartContractAddressChange}
            reset={false}
            initValue={scAddress || ""}
            label="Smatrt Contract Address"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 mb-2 text-white"
          onClick={handleUpdate}
        >
          Edit
        </button>
      </div>
    </GeneralModal>
  );
};
