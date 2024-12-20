import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useAddProtocolModal } from "@/app/stores/modal";
import { getConfig } from "@/app/wagmi";

import { BtcAddress } from "@/app/components/Staking/Form/BtcAddress";
import { InputField } from "@/app/components/Staking/Form/InputField";
import { SelectField } from "@/app/components/Staking/Form/SelectField";

import { useScalarClient } from "@/app/context/ScalarProvider";
import { useScalarVaultModule } from "@/app/context/VaultContext";
import { CreateProtocolRequest, ProtocolStatus } from "@/app/types/protocol";
import { hexStringWithout0x } from "@/utils/trim";
import { GeneralModal } from "./GeneralModal";

export const AddProtocolModal: React.FC<{}> = () => {
  const scalarVaultModule = useScalarVaultModule();
  const scalarClient = useScalarClient();

  const { isOpen, close } = useAddProtocolModal();
  const [protocolName, setProtocolName] = useState("");
  const [serviceTag, setServiceTag] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [btcPubKey, setBtcPubKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isCustodianOnly, setIsCustodianOnly] = useState(false);
  const [btcNetwork, setBtcNetwork] = useState("");
  const [signerApiEndpoint, setSignerApiEndpoint] = useState("");
  const [custodianGroupName, setCustodianGroupName] = useState("");
  const config = getConfig();
  const chains = config.chains;

  const { data: availableBtcNetworks } = useQuery({
    queryKey: ["getAvailableBtcNetworks"],
    queryFn: () => scalarClient.client.getAvailableBtcNetworks(),
    enabled: isOpen,
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
    refetchInterval: 60000,
  });

  const {
    data: availableCustodianGroups,
    isLoading: isAvailableCustodianGroupsLoading,
  } = useQuery({
    queryKey: ["getAvailableCustodianGroups", btcNetwork],
    queryFn: () =>
      scalarClient.client.getAvailableCustodianGroupsByBtcNetworkName(
        btcNetwork,
      ),
    enabled: isOpen && btcNetwork !== "",
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
  });

  const handleCustodianGroupChange = (groupName: string) => {
    setCustodianGroupName(groupName);
  };

  const setScalarPubkey = (input: string) => {
    // setScalarPubkey(input);
  };

  const handleAdd = async () => {
    // Check for required fields based on protocol type
    const baseRequiredFields = [
      { value: protocolName, name: "Protocol Name" },
      { value: btcNetwork, name: "BTC Network" },
      { value: custodianGroupName, name: "Custodian Group Name" },
      { value: btcPubKey, name: "Scalar Pubkey" },
      { value: serviceTag, name: "Service Tag" },
    ];

    const signerRequiredFields = !isCustodianOnly
      ? [
          { value: signerApiEndpoint, name: "Signer API Endpoint" },
          { value: accessToken, name: "Access Token" },
          { value: btcAddress, name: "Bitcoin Address" },
          { value: btcPubKey, name: "Bitcoin Public Key" },
        ]
      : [];

    const allRequiredFields = [...baseRequiredFields, ...signerRequiredFields];

    // Check for missing required fields
    const missingFields = allRequiredFields.filter((field) => !field.value);
    if (missingFields.length > 0) {
      console.error(
        "Missing required fields:",
        missingFields.map((f) => f.name).join(", "),
      );
      return;
    }

    const scalarPubKey = scalarVaultModule.hexToBytes(
      hexStringWithout0x(btcPubKey),
    );
    const btcPubKeyBytes = scalarVaultModule.hexToBytes(
      hexStringWithout0x(btcPubKey),
    );

    try {
      const createProtocolRequest: CreateProtocolRequest = {
        name: protocolName,
        pubkey: scalarPubKey,
        service_tag: serviceTag,

        // BTC Chain related fields
        btc_network: btcNetwork,
        btc_signer_endpoint: isCustodianOnly ? "" : signerApiEndpoint,
        btc_signer_access_token: isCustodianOnly ? "" : accessToken,
        btc_signer_address: isCustodianOnly ? "" : btcAddress,
        btc_signer_pk: isCustodianOnly ? new Uint8Array() : btcPubKeyBytes,

        // Custodian group related fields
        custodian_group_name: custodianGroupName,
        is_custodian_only: isCustodianOnly,
        status: ProtocolStatus.Activated, // Default to activated
      };

      // TODO: Replace with actual API call
      // await postProtocol(createProtocolRequest);

      console.log("Successfully added Protocol", createProtocolRequest);
      close();
    } catch (error) {
      console.error("Failed to add protocol:", error);
    }
  };

  useEffect(() => {
    if (isCustodianOnly) {
      setSignerApiEndpoint("");
      setAccessToken("");
      setBtcAddress("");
      setBtcPubKey("");
    }
  }, [isCustodianOnly]);

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Fill in Protocol information!</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setProtocolName}
            reset={false}
            initValue=""
            label="Protocol Name"
            placeholder="Protocol Name"
            generalErrorMessage="Please input a protocol name"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setScalarPubkey}
            reset={false}
            initValue=""
            label="Scalar Pubkey"
            placeholder="Scalar Pubkey"
            generalErrorMessage="Please input a Scalar Pubkey"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <InputField
            onChange={setServiceTag}
            reset={false}
            initValue=""
            label="Service Tag"
            placeholder="pools"
            generalErrorMessage="Please input a Service Tag"
            disabled={false}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <SelectField
            onChange={setBtcNetwork}
            reset={false}
            initValue=""
            options={availableBtcNetworks || []}
            label="BTC Network"
            placeholder="Select BTC Network"
            errorMessage="Please select a BTC Network"
          />
        </div>
        {/* ----- Protocol Type ----- */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            className="checkbox"
            checked={isCustodianOnly}
            onChange={(e) => setIsCustodianOnly(e.target.checked)}
          />
          <label>Custodian Only</label>
        </div>
        {!isCustodianOnly && (
          <>
            {/* ----- Protocol BTC Signer Group ----- */}
            <div className="mb-2 font-semibold text-center">
              Protocol BTC Signer
            </div>
            <div className="flex flex-1 flex-col">
              <InputField
                onChange={setSignerApiEndpoint}
                reset={false}
                initValue=""
                label="Signer API Endpoint"
                placeholder="https://signer.example.com"
                generalErrorMessage="Please input a Signer API Endpoint"
                disabled={false}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <InputField
                onChange={setAccessToken}
                reset={false}
                initValue=""
                label="Access Token"
                placeholder="aaaaaabb-ee11-aaaa-4477-de5de8f3caca"
                generalErrorMessage="Please input a Access Token"
                disabled={false}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <BtcAddress
                onChange={setBtcAddress}
                reset={false}
                initValue=""
                label="Protocol Bitcoin Address"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <InputField
                onChange={setBtcPubKey}
                reset={false}
                initValue=""
                label="Protocol Bitcoin Public Key"
                placeholder=""
                generalErrorMessage="Please input a Protocol Bitcoin Public Key"
                disabled={false}
              />
            </div>
          </>
        )}
        {/* ----- Custodian Group ----- */}
        <div className="mb-2 font-semibold text-center">Custodian Group</div>
        <div className="flex flex-1 flex-col">
          <SelectField
            onChange={handleCustodianGroupChange}
            reset={false}
            initValue=""
            options={availableCustodianGroups?.custodian_groups_name || []}
            label="Custodian Group Name"
            placeholder="Select Custodian Group"
            errorMessage="Please select a Custodian Group"
            disabled={isAvailableCustodianGroupsLoading}
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
