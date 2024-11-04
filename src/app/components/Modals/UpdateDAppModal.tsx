import { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { updateDApp } from "@/app/api/dApp";
import { useDAppModal } from "@/app/stores/modal";
import { DApp } from "@/app/types/dApps";
import { getConfig } from "@/app/wagmi";

import { BtcAddress } from "../Staking/Form/BtcAddress";
import { BtcPubKey } from "../Staking/Form/BtcPubkey";
import { ChainName } from "../Staking/Form/ChainName";
import { InputField } from "../Staking/Form/InputField";

import { GeneralModal } from "./GeneralModal";

export const UpdateDAppModal: React.FC<{}> = ({}) => {
  const { dApp, isOpen, close } = useDAppModal();
  const [updatedDApp, setUpdatedDApp] = useState<DApp | undefined>(dApp);

  const [isCustomChain, setIsCustomChain] = useState(false);
  const config = getConfig();
  const chains = config.chains;

  // const handleChainNameChange = (input: string) => {
  //   setChainName(input);
  //   // Find the selected chain based on the name
  //   const selectedChain = chains.find((chain) => chain.name === input);
  //   if (selectedChain) {
  //     // Update chainId and chainEndpoint based on the selected chain
  //     setChainId(selectedChain.id.toString());
  //     setChainEndpoint(selectedChain.rpcUrls.default.http[0]);
  //   } else if (!isCustomChain) {
  //     // If no matching chain is found, reset the values
  //     setChainId("");
  //     setChainEndpoint("");
  //   }
  // };
  // const handleBtcAddressChange = (input: string) => {
  //   setBtcAddress(input);
  // };
  // const handleBtcPubKeyChange = (input: string) => {
  //   setBtcPubKey(input);
  // };

  // const handleSmartContractAddressChange = (input: string) => {
  //   setScAddress(input);
  // };

  // const handleTokenContractAddressChange = (input: string) => {
  //   setTokenContractAddress(input);
  // };

  const handleChange = (key: keyof DApp, value: string) => {
    if (!updatedDApp) return;
    setUpdatedDApp({ ...updatedDApp, [key]: value });
  };

  const [loading, setLoading] = useState(false);

  const handleUpdate = useCallback(async () => {
    setLoading(true);
    if (
      !updatedDApp?.id ||
      !updatedDApp?.chainName ||
      !updatedDApp?.chainId ||
      !updatedDApp?.chainEndpoint ||
      !updatedDApp?.dappBtcSignerEndpoint ||
      !updatedDApp?.accessToken ||
      !updatedDApp?.btcAddress ||
      !updatedDApp.btcPk ||
      !updatedDApp.scAddress ||
      !updatedDApp.tokenContractAddress
    ) {
      console.log({ updatedDApp });
      console.error("Missing required fields");
      setLoading(false);
      return;
    }
    await updateDApp(
      updatedDApp.id,
      updatedDApp.chainName,
      updatedDApp.chainId,
      updatedDApp.chainEndpoint,
      updatedDApp.dappBtcSignerEndpoint,
      updatedDApp.accessToken,
      updatedDApp.btcAddress,
      updatedDApp.btcPk,
      updatedDApp.scAddress,
      updatedDApp.tokenContractAddress,
    )
      .then(() => {
        console.log("Successfully updated DApp");
        close();
      })
      .catch((error: any) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [updatedDApp, setLoading, close]);

  useEffect(() => {
    if (!updatedDApp) {
      setUpdatedDApp(dApp);
    }
  }, [dApp, updatedDApp, setUpdatedDApp]);

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Edit DApp information!</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <ChainName
            onChange={(value) => handleChange("chainName", value)}
            reset={false}
            initValue={dApp?.chainName || ""}
            chainNames={chains.map((chain) => chain.name)}
            isCustom={isCustomChain}
            setIsCustom={setIsCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={(value) => handleChange("chainId", value)}
            reset={false}
            initValue={isCustomChain ? "" : dApp?.chainId || ""}
            label="Chain ID"
            placeholder=""
            generalErrorMessage="Please input a chain ID"
            disabled={!isCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={(value) => handleChange("chainEndpoint", value)}
            reset={false}
            initValue={isCustomChain ? "" : dApp?.chainEndpoint || ""}
            label="Chain endpoint"
            placeholder=""
            generalErrorMessage="Please input a chain endpoint"
            disabled={!isCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={(value) => handleChange("dappBtcSignerEndpoint", value)}
            reset={false}
            initValue={dApp?.dappBtcSignerEndpoint || ""}
            label="DApp Bitcoin Signer API Endpoint"
            placeholder=""
            generalErrorMessage="Please input a DApp Bitcoin Signer API Endpoint"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={(value) => handleChange("accessToken", value)}
            reset={false}
            initValue={dApp?.accessToken || ""}
            label="DApp Access Token"
            placeholder=""
            generalErrorMessage="Please input a DApp Access Token"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={(value) => handleChange("btcAddress", value)}
            reset={false}
            initValue={dApp?.btcAddress || ""}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcPubKey
            onChange={(value) => handleChange("btcPk", value)}
            reset={false}
            initValue={dApp?.btcPk || ""}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={(value) => handleChange("scAddress", value)}
            reset={false}
            initValue={dApp?.scAddress || ""}
            label="Smart Contract Address"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={(value) => handleChange("tokenContractAddress", value)}
            reset={false}
            initValue={dApp?.tokenContractAddress || ""}
            label="Token Contract Address"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 mb-2 text-white"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Edit DApp"}
        </button>
      </div>
    </GeneralModal>
  );
};
