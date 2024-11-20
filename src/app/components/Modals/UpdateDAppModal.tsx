import { useQueryClient } from "@tanstack/react-query";
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
import { SelectField } from "../Staking/Form/SelectField";

import { GeneralModal } from "./GeneralModal";

export const UpdateDAppModal: React.FC<{}> = ({}) => {
  const { dApp, isOpen, close } = useDAppModal();
  const [updatedDApp, setUpdatedDApp] = useState<DApp | undefined>(dApp);
  const [newCustodialGroupName, setNewCustodialGroupName] = useState<string>(
    dApp?.custodialGroup.Name || "",
  );

  const [isCustomChain, setIsCustomChain] = useState(false);
  const config = getConfig();
  const chains = config.chains;

  const handleChange = (key: keyof DApp, value: string) => {
    if (!updatedDApp) return;
    setUpdatedDApp({ ...updatedDApp, [key]: value });
  };

  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

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
      !updatedDApp.tokenContractAddress ||
      !newCustodialGroupName
    ) {
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
      newCustodialGroupName,
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
        queryClient.invalidateQueries({ queryKey: ["getListDApps"] });
      });
  }, [updatedDApp, setLoading, close, queryClient]);

  useEffect(() => {
    if (!updatedDApp) {
      setUpdatedDApp(dApp);
    }
    if (dApp?.custodialGroup?.Name) {
      setNewCustodialGroupName(dApp.custodialGroup.Name);
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
          <SelectField
            onChange={(value) => setNewCustodialGroupName(value)}
            reset={false}
            initValue={newCustodialGroupName || ""}
            options={["All"]}
            label="Custodial Group"
            placeholder="Select Custodial Group"
            errorMessage="Please select a custodial group"
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
