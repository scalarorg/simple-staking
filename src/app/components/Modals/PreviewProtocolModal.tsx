import { XIcon } from "lucide-react";
import { useState } from "react";

import { useProtocolModal } from "@/app/stores/modal";
import { getConfig } from "@/app/wagmi";

import { ProtocolStatus } from "@/app/types/protocol";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GeneralModal } from "./GeneralModal";

export const PreviewProtocolModal: React.FC<{}> = ({}) => {
  const { protocol, isOpen, close } = useProtocolModal();

  const [isCustomChain, setIsCustomChain] = useState(false);
  const config = getConfig();
  const chains = config.chains;

  const [loading, setLoading] = useState(false);

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Preview protocol information</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-500">Protocol Name</Label>
          <Input readOnly value={protocol?.name || ""} />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500">Service Tag</Label>
          <Input readOnly value={protocol?.service_tag || ""} />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500">Status</Label>
          <Input
            readOnly
            value={protocol ? ProtocolStatus[protocol.status] : ""}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500">Is Custodian Only</Label>
          <Input readOnly value={protocol?.is_custodian_only ? "Yes" : "No"} />
        </div>

        {/* BTC Chain Information Section - Only show if not custodian only */}
        {!protocol?.is_custodian_only && (
          <div className="space-y-2 py-3">
            <h3 className="text-base font-medium">BTC Chain Information</h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Network</Label>
                <Input
                  readOnly
                  value={protocol?.btc_chain?.btc_network || ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Endpoint</Label>
                <Input
                  readOnly
                  value={protocol?.btc_chain?.btc_signer_endpoint || ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Address</Label>
                <Input
                  readOnly
                  value={protocol?.btc_chain?.btc_signer_address || ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Public Key</Label>
                <Input
                  readOnly
                  value={
                    protocol?.btc_chain?.btc_signer_pk
                      ? Buffer.from(protocol.btc_chain.btc_signer_pk).toString(
                          "hex",
                        )
                      : ""
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Custodian Group Information Section */}
        <div className="space-y-2 py-3">
          <h3 className="text-base font-medium">Custodian Group Information</h3>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500">Smart contract address</Label>
              <Input
                readOnly
                value={protocol?.custodian_group?.TaprootAddress || ""}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500">Custodian Group Name</Label>
              <Input readOnly value={protocol?.custodian_group?.Name || ""} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500">
                Custodians ({protocol?.custodian_group?.Quorum || 0} of{" "}
                {protocol?.custodian_group?.Custodians?.length || 0} required)
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                {protocol?.custodian_group?.Custodians?.map(
                  (custodian, index) => (
                    <div
                      key={index}
                      className="flex flex-col space-y-1 text-sm"
                    >
                      <div className="font-medium">Custodian #{index + 1}</div>
                      <div className="text-muted-foreground">
                        BTC Public Key:{" "}
                        {custodian.BtcPublicKey
                          ? Buffer.from(custodian.BtcPublicKey).toString("hex")
                          : ""}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Destination Chains Information Section */}
        <div className="space-y-2 py-3">
          <h3 className="text-base font-medium">
            Destination Chains Information
          </h3>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500">
                Destination Chains ({protocol?.dest_chains?.length || 0})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                {protocol?.dest_chains?.map((chain, index) => (
                  <div key={index} className="flex flex-col space-y-1 text-sm">
                    <div className="font-medium">Chain #{index + 1}</div>
                    <div className="text-muted-foreground">
                      <div>Name: {chain.chain_name}</div>
                      <div>Chain ID: {chain.chain_id}</div>
                      <div>Type: {chain.chain_type}</div>
                      <div>Token Name: {chain.token_name}</div>
                      <div>
                        Smart Contract Address:{" "}
                        {chain.chain_smart_contract_address
                          ? Buffer.from(
                              chain.chain_smart_contract_address,
                            ).toString("hex")
                          : ""}
                      </div>
                      <div>
                        Token Contract Address:{" "}
                        {chain.token_contract_address
                          ? Buffer.from(chain.token_contract_address).toString(
                              "hex",
                            )
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};
