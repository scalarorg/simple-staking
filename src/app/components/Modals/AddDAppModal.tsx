import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import { postDApp } from "@/app/api/postDApps";

import { BtcAddress } from "../Staking/Form/BtcAddress";
import { BtcPubKey } from "../Staking/Form/BtcPubkey";
import { ChainName } from "../Staking/Form/ChainName";

import { GeneralModal } from "./GeneralModal";

interface AddDAppModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export const AddDAppModal: React.FC<AddDAppModalProps> = ({
  open,
  onClose,
}) => {
  const [chainName, setChainName] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [btcPubKey, setBtcPubKey] = useState("");
  const [smartContractAddress, setSmartContractAddress] = useState("");

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
    setSmartContractAddress(input);
  };

  const handleAdd = async () => {
    if (!chainName || !btcAddress || !btcPubKey || !smartContractAddress) {
      console.error("Missing required fields");
      return;
    }
    await postDApp(chainName, btcAddress, btcPubKey, smartContractAddress)
      .then(() => {
        console.log("Successfully added DApp");
        onClose(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Fill in DApp information!</h3>
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
            initValue=""
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={handleBtcAddressChange}
            reset={false}
            initValue=""
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcPubKey
            onChange={handleBtcPubKeyChange}
            reset={false}
            initValue=""
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={handleSmartContractAddressChange}
            reset={false}
            initValue=""
            label="Smart contract address"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 mb-2 text-white"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
    </GeneralModal>
  );
};
