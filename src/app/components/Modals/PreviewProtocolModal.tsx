"use client";

import { XIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LiquidityModel, ProtocolStatus } from "scalarjs-sdk/dist/types";

import { useProtocolModal } from "@/app/stores/modal";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useVault } from "@/app/context/VaultContext";
import { useWalletProvider } from "@/app/context/WalletProvider";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { GeneralModal } from "./GeneralModal";

export const PreviewProtocolModal: React.FC<{}> = ({ }) => {
  const { protocol, isOpen, close } = useProtocolModal();
  const scalarClient = useScalarClient();

  const { data } = useQuery({
    enabled: !!scalarClient,
    queryKey: ["getVersionAndTag"],
    queryFn: () => scalarClient.client.getVersionAndTag(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
  });

  const publicVersion = String(data?.version);
  const publicTag = data?.tag;
  const vault = useVault(protocol?.tag, publicTag, publicVersion);
  const { btcNetwork } = useWalletProvider();
  const isCustodianOnly = protocol?.attribute?.model === LiquidityModel.POOLING;

  // Chains
  const btcChain = protocol?.chains.find(
    (chain) => chain.supported_chain.token.oneofKind === "btc",
  );
  const btcNetworkType = btcChain
    ? scalarClient.client.getBtcChainName(btcChain)
    : "";
  const destinationChains =
    protocol?.chains?.filter(
      (chain) => chain.supported_chain.token.oneofKind !== "btc",
    ) || [];

  // Modal content
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
          <Input readOnly value={protocol?.tag || ""} />
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
          <Input readOnly value={isCustodianOnly ? "Yes" : "No"} />
        </div>

        {/* BTC Chain Information Section - Only show if not custodian only */}
        {!isCustodianOnly && (
          <div className="space-y-2 py-3">
            <h3 className="text-base font-medium">BTC Chain Information</h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Network</Label>
                <Input readOnly value={btcNetworkType || ""} />
              </div>
              {/* <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Endpoint</Label>
                <Input
                  readOnly
                  value={btcChain?.supported_chain.btc_signer_endpoint || ""}
                />
              </div> */}
              <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Address</Label>
                <Input
                  readOnly
                  value={btcChain?.supported_chain.address || ""}
                />
              </div>
              {/* TODO: Add BTC Signer Public Key to Scalar Node supported token type */}
              {/* <div className="space-y-2">
                <Label className="text-gray-500">BTC Signer Public Key</Label>
                <Input
                  readOnly
                  value={
                    btcChain?.supported_chain.token.oneofKind === "btc"
                      ? Buffer.from(
                          btcChain.supported_chain.token.btc.publicKey,
                        ).toString("hex")
                      : ""
                  }
                />
              </div> */}
            </div>
          </div>
        )}

        {/* Custodian Group Information Section */}
        <div className="space-y-2 py-3">
          <h3 className="text-base font-medium">Custodian Group Information</h3>
          <div className="flex flex-col gap-4">
            {/* <div className="space-y-2">
              <Label className="text-gray-500">Taproot Address</Label>
              <Input readOnly value={taprootAddress || ""} />
            </div> */}
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
                Destination Chains ({destinationChains.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                {destinationChains.map((chain, index) => (
                  <div key={index} className="flex flex-col space-y-1 text-sm">
                    <div className="font-medium">Chain #{index + 1}</div>
                    <div className="text-muted-foreground">
                      <div>Name: {chain.chain_name}</div>
                      <div>Chain ID: {chain.chain_id}</div>
                      <div>Type: {chain.chain_type}</div>
                      <div>
                        Token Name:{" "}
                        {chain.supported_chain.token.oneofKind === "erc20"
                          ? chain.supported_chain.token.erc20.asset
                          : ""}
                      </div>
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
                        {chain.supported_chain.token.oneofKind === "erc20"
                          ? chain.supported_chain.token.erc20.tokenAddress
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
