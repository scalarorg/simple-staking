import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { updateDApp } from "@/app/api/dApp";
import { useBtcNetwork } from "@/app/context/BtcNetworkProvider";
import { DApp as DAppInterface } from "@/app/types/dApps";
import { getConfig } from "@/app/wagmi";

import { BtcAddress } from "../Staking/Form/BtcAddress";
import { BtcPubKey } from "../Staking/Form/BtcPubkey";
import { ChainName } from "../Staking/Form/ChainName";
import { InputField } from "../Staking/Form/InputField";

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
  const { btcNetwork } = useBtcNetwork();
  const [chainName, setChainName] = useState(dApp?.chainName);
  const [chainId, setChainId] = useState(dApp?.chainId || "");
  const [chainEndpoint, setChainEndpoint] = useState(dApp?.chainEndpoint || "");
  const [btcAddress, setBtcAddress] = useState(dApp?.btcAddress);
  const [btcPubKey, setBtcPubKey] = useState(dApp?.btcPk);
  const [scAddress, setScAddress] = useState(dApp?.scAddress);
  const [id, setId] = useState(dApp?.id);
  const [isCustomChain, setIsCustomChain] = useState(false);

  const config = getConfig(btcNetwork!);
  const chains = config.chains;

  // setIsCustomChain(
  //   chains.find((chain) => {
  //     chain.name === chainName;
  //   })
  //     ? false
  //     : true,
  // );

  useEffect(() => {
    setChainName(dApp?.chainName);
    setChainId(dApp?.chainId || "");
    setChainEndpoint(dApp?.chainEndpoint || "");
    setBtcAddress(dApp?.btcAddress);
    setBtcPubKey(dApp?.btcPk);
    setId(dApp?.id);
    setScAddress(dApp?.scAddress);
  }, [dApp]);

  const handleChainNameChange = (input: string) => {
    setChainName(input);
    // Find the selected chain based on the name
    const selectedChain = chains.find((chain) => chain.name === input);
    if (selectedChain) {
      // Update chainId and chainEndpoint based on the selected chain
      setChainId(selectedChain.id.toString());
      setChainEndpoint(selectedChain.rpcUrls.default.http[0]);
    } else if (!isCustomChain) {
      // If no matching chain is found, reset the values
      setChainId("");
      setChainEndpoint("");
    }
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
    if (
      !id ||
      !chainName ||
      !chainId ||
      !chainEndpoint ||
      !btcAddress ||
      !btcPubKey ||
      !scAddress
    ) {
      console.error("Missing required fields");
      return;
    }
    await updateDApp(
      id,
      chainName,
      chainId,
      chainEndpoint,
      btcAddress,
      btcPubKey,
      scAddress,
    )
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
            chainNames={chains.map((chain) => chain.name)}
            isCustom={isCustomChain}
            setIsCustom={setIsCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setChainId}
            reset={false}
            initValue={isCustomChain ? "" : chainId}
            label="Chain ID"
            placeholder=""
            generalErrorMessage="Please input a chain ID"
            disabled={!isCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setChainEndpoint}
            reset={false}
            initValue={isCustomChain ? "" : chainEndpoint}
            label="Chain endpoint"
            placeholder=""
            generalErrorMessage="Please input a chain endpoint"
            disabled={!isCustomChain}
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
