import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import { postDApp } from "@/app/api/dApp";
import { useAddDAppModal } from "@/app/stores/modal";
import { getConfig } from "@/app/wagmi";

import { BtcAddress } from "../Staking/Form/BtcAddress";
import { BtcPubKey } from "../Staking/Form/BtcPubkey";
import { ChainName } from "../Staking/Form/ChainName";
import { InputField } from "../Staking/Form/InputField";

import { getCustodialGroupNames } from "@/app/api/custodial";
import { SelectField } from "../Staking/Form/SelectField";
import { GeneralModal } from "./GeneralModal";

export const AddDAppModal: React.FC<{}> = () => {
  const { isOpen, close } = useAddDAppModal();
  const [chainName, setChainName] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [btcPubKey, setBtcPubKey] = useState("");
  const [smartContractAddress, setSmartContractAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainEndpoint, setChainEndpoint] = useState("");
  const [dappBtcSignerEndpoint, setDappBtcSignerEndpoint] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isCustomChain, setIsCustomChain] = useState(false);
  const [tokenContractAddress, setTokenContractAddress] = useState("");
  const [custodialGroupName, setCustodialGroupName] = useState("");
  const config = getConfig();
  const chains = config.chains;

  const {
    data: custodialGroups,
    isLoading,
    error: custodialGroupsError,
    isError: hasCustodialGroupsError,
  } = useQuery({
    queryKey: ["getCustodialGroupNames"],
    queryFn: () => getCustodialGroupNames(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
  });

  const handleChainNameChange = (input: string) => {
    setChainName(input);
    // Find the selected chain based on the name
    const selectedChain = chains.find((chain) => chain.name === input);
    if (selectedChain) {
      // Update chainId and chainEndpoint based on the selected chain
      setChainId(selectedChain.id.toString());
      setChainEndpoint(selectedChain.rpcUrls.default.http[0]);
    } else {
      // If no matching chain is found, reset the values
      setChainId("");
      setChainEndpoint("");
    }
  };

  // TODO: add chainID and chainEndpoint to the postDApp function
  const handleAdd = async () => {
    if (
      !chainName ||
      !chainId ||
      !chainEndpoint ||
      !dappBtcSignerEndpoint ||
      !accessToken ||
      !btcAddress ||
      !btcPubKey ||
      !smartContractAddress ||
      !tokenContractAddress ||
      !custodialGroupName
    ) {
      console.error("Missing required fields");
      return;
    }
    await postDApp(
      chainName,
      chainId,
      chainEndpoint,
      dappBtcSignerEndpoint,
      accessToken,
      btcAddress,
      btcPubKey,
      smartContractAddress,
      tokenContractAddress,
      custodialGroupName,
    )
      .then(() => {
        console.log("Successfully added DApp");
        close();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Fill in DApp information!</h3>
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
            onChange={handleChainNameChange}
            reset={false}
            initValue=""
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
          <SelectField
            onChange={setCustodialGroupName}
            reset={false}
            initValue=""
            options={custodialGroups?.groupNames || []}
            label="Custodial Group"
            placeholder={isLoading ? "Loading..." : "Select Custodial Group"}
            errorMessage={
              hasCustodialGroupsError
                ? "Failed to load custodial groups"
                : "Please select a custodial group"
            }
          />
        </div>
        <div className="flex flex-1 flex-col hidden">
          <InputField
            onChange={setChainEndpoint}
            reset={false}
            initValue={isCustomChain ? "" : chainEndpoint}
            label="Chain Endpoint"
            placeholder=""
            generalErrorMessage="Please input a chain endpoint"
            disabled={!isCustomChain}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setDappBtcSignerEndpoint}
            reset={false}
            initValue=""
            label="DApp Bitcoin Signer API Endpoint"
            generalErrorMessage="Please input a DApp Bitcoin Signer API Endpoint"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setAccessToken}
            reset={false}
            initValue=""
            label="DApp Access Token"
            generalErrorMessage="Please input a DApp Access Token"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={setBtcAddress}
            reset={false}
            initValue=""
            label="DApp Bitcoin Address"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcPubKey
            onChange={setBtcPubKey}
            reset={false}
            initValue=""
            label="DApp Bitcoin Public Key"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={setSmartContractAddress}
            reset={false}
            initValue=""
            label="Smart Contract Address"
            placeholder="0x"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <BtcAddress
            onChange={setTokenContractAddress}
            reset={false}
            initValue=""
            label="Token Contract Address"
            placeholder="0x"
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
