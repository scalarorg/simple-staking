import { GeneralModal } from "@/app/components/Modals/GeneralModal";
import { InputField } from "@/app/components/Staking/Form/InputField";
import { SelectField } from "@/app/components/Staking/Form/SelectField";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useScalarVaultModule } from "@/app/context/VaultContext";
import { useAddDestinationChainModal } from "@/app/stores/modal";
import { AddDestinationChainRequest } from "@/app/types/protocol";
import { hexStringWithout0x } from "@/utils/trim";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";

export const AddDestinationChainModal: React.FC<{}> = () => {
  const { isOpen, close, protocol } = useAddDestinationChainModal();
  const scalarClient = useScalarClient();
  const scalarVaultModule = useScalarVaultModule();

  // Form state
  const [chainName, setChainName] = useState("");
  const [chainType, setChainType] = useState("");
  const [smartContractAddress, setSmartContractAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenContractAddress, setTokenContractAddress] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<string>("");

  const { data: availableChainTypes } = useQuery({
    queryKey: ["getAvailableChainTypes"],
    queryFn: () => scalarClient.client.getAvailableChainTypes(),
    enabled: isOpen,
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
    refetchInterval: 60000,
  });

  const { data: availableChains } = useQuery({
    queryKey: ["getAvailableChains", chainType],
    queryFn: () => scalarClient.client.getAvailableChainByChainType(chainType),
    enabled: isOpen && chainType !== "",
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
  });

  const handleAdd = async () => {
    // Validate required fields
    const requiredFields = [
      { value: chainName, name: "Chain Name" },
      { value: chainType, name: "Chain Type" },
      { value: smartContractAddress, name: "Smart Contract Address" },
      { value: tokenName, name: "Token Name" },
      { value: tokenContractAddress, name: "Token Contract Address" },
    ];

    const missingFields = requiredFields.filter((field) => !field.value);
    if (missingFields.length > 0) {
      console.error(
        "Missing required fields:",
        missingFields.map((f) => f.name).join(", "),
      );
      return;
    }

    try {
      const request: AddDestinationChainRequest = {
        protocol_name: protocol?.name || "",
        chain_name: chainName,
        chain_type: chainType,
        chain_smart_contract_address: scalarVaultModule.hexToBytes(
          hexStringWithout0x(smartContractAddress),
        ),
        token_name: tokenName,
        token_contract_address: scalarVaultModule.hexToBytes(
          hexStringWithout0x(tokenContractAddress),
        ),
      };

      // TODO: Replace with actual API call
      // await scalarClient.client.addDestinationChain(request);

      console.log("Successfully added Destination Chain", request);
      close();
    } catch (error) {
      console.error("Failed to add destination chain:", error);
    }
  };

  const handleChainNameChange = (chainName: string) => {
    setChainName(chainName);
    const selectedChain = availableChains?.chains.find(
      (chain) => chain.chain_name === chainName,
    );
    setSelectedChainId(selectedChain?.chain_id.toString() || "");
  };

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Fill in Destination Chain information!</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <SelectField
          onChange={setChainType}
          reset={false}
          initValue=""
          options={availableChainTypes || []}
          label="Chain Type"
          placeholder="Select Chain Type"
          errorMessage="Please select a chain type"
          disabled={false}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <SelectField
            onChange={handleChainNameChange}
            reset={false}
            initValue=""
            options={
              availableChains?.chains.map((chain) => chain.chain_name) || []
            }
            label="Chain Name"
            placeholder="Select Chain Name"
            errorMessage="Please select a chain name"
            disabled={!chainType}
          />
        </div>
        {selectedChainId && (
          <div className="mb-4 text-sm text-gray-600">
            Chain ID: {selectedChainId}
          </div>
        )}
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setSmartContractAddress}
            reset={false}
            initValue=""
            label="Smart Contract Address"
            placeholder="0x"
            generalErrorMessage="Please input a smart contract address"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setTokenName}
            reset={false}
            initValue=""
            label="Token Name"
            placeholder="Token Name"
            generalErrorMessage="Please input a token name"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setTokenContractAddress}
            reset={false}
            initValue=""
            label="Token Contract Address"
            placeholder="0x"
            generalErrorMessage="Please input a token contract address"
            disabled={false}
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
