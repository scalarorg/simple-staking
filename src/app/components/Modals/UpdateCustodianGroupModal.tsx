import { Trash2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CustodianStatus } from "scalarjs-sdk/dist/types";

import { GeneralModal } from "@/app/components/Modals/GeneralModal";
import { InputField } from "@/app/components/Staking/Form/InputField";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useCustodianGroupModal } from "@/app/stores/modal";
import { Custodian } from "@/app/types/custodians";

export const UpdateCustodianGroupModal: React.FC<{}> = ({}) => {
  const { custodianGroup, isOpen, close } = useCustodianGroupModal();
  const scalarClient = useScalarClient();
  const [name, setName] = useState("");
  const [btcNetwork, setBtcNetwork] = useState("");
  const [taprootAddress, setTaprootAddress] = useState("");
  const [quorum, setQuorum] = useState<number>(0);
  const [newCustodian, setNewCustodian] = useState<Custodian>({
    Name: "",
    Status: CustodianStatus.ACTIVATED,
    BtcPublicKey: new Uint8Array(),
    Description: "",
  });
  const [btcPublicKeyInput, setBtcPublicKeyInput] = useState("");

  // Update form when custodianGroup changes
  useEffect(() => {
    if (custodianGroup) {
      setName(custodianGroup.Name || "");
      setTaprootAddress(custodianGroup.BtcPublicKey || "");
      setQuorum(custodianGroup.Quorum || 0);
    }
  }, [custodianGroup]);

  const handleUpdateCustodianGroup = async () => {
    if (!custodianGroup) return;

    const updateCustodianGroupRequest = {
      name,
      btc_network: btcNetwork,
      taproot_address: taprootAddress,
      quorum,
    };

    // TODO: Replace with actual API call
    // await scalarClient.client.updateCustodianGroup(updateCustodianGroupRequest);

    console.log(
      "Successfully updated custodian group",
      updateCustodianGroupRequest,
    );
    close();
  };

  const handleAddCustodian = () => {
    if (!custodianGroup) return;
    if (!newCustodian.Name || newCustodian.BtcPublicKey.length === 0) {
      console.error("Name and BTC Public Key are required");
      return;
    }

    const updatedCustodians = [
      ...(custodianGroup.Custodians || []),
      newCustodian,
    ];
    custodianGroup.Custodians = updatedCustodians;

    // Reset form
    setNewCustodian({
      Name: "",
      Status: CustodianStatus.ACTIVATED,
      BtcPublicKey: new Uint8Array(),
      Description: "",
    });
    setBtcPublicKeyInput("");
  };

  const handleDeleteCustodian = (index: number) => {
    if (!custodianGroup?.Custodians) return;

    const updatedCustodians = [...custodianGroup.Custodians];
    updatedCustodians.splice(index, 1);
    custodianGroup.Custodians = updatedCustodians;
  };

  const handleToggleStatus = (index: number) => {
    if (!custodianGroup?.Custodians) return;

    const updatedCustodians = [...custodianGroup.Custodians];
    updatedCustodians[index] = {
      ...updatedCustodians[index],
      Status:
        updatedCustodians[index].Status === CustodianStatus.ACTIVATED
          ? CustodianStatus.DEACTIVATED
          : CustodianStatus.ACTIVATED,
    };
    custodianGroup.Custodians = updatedCustodians;
  };

  return (
    <GeneralModal open={isOpen} onClose={close} big>
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-bold">Update custodian group information</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>

      <div className="flex flex-1 flex-col space-y-4">
        {/* General Information Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleUpdateCustodianGroup}
            >
              Update Custodian Group
            </button>
            <h3 className="text-base font-medium">General Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500">Group Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500">BTC Network</Label>
              <Input
                value={btcNetwork}
                onChange={(e) => setBtcNetwork(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500">Taproot Address</Label>
              <Input
                value={taprootAddress}
                onChange={(e) => setTaprootAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500">Quorum Required</Label>
              <Input
                type="number"
                value={quorum}
                onChange={(e) => setQuorum(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Custodians List Section */}
        <hr className="border-t border-gray-200" />

        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Custodians</h3>
            <span className="text-sm text-muted-foreground">
              {custodianGroup?.Custodians?.length || 0} custodians
            </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
            {custodianGroup?.Custodians?.map((custodian, index) => (
              <div key={index} className="flex flex-col space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Custodian #{index + 1}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={custodian.Status === CustodianStatus.ACTIVATED}
                        onCheckedChange={() => handleToggleStatus(index)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {custodian.Status === CustodianStatus.ACTIVATED
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCustodian(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  <div>Name: {custodian.Name}</div>
                  <div>Description: {custodian.Description}</div>
                  <div>
                    BTC Public Key:{" "}
                    {custodian.BtcPublicKey
                      ? Buffer.from(custodian.BtcPublicKey).toString("hex")
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Add New Custodian Section */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Add New Custodian</h3>
          <div className="space-y-4">
            <InputField
              onChange={(value) =>
                setNewCustodian({ ...newCustodian, Name: value })
              }
              reset={false}
              initValue={newCustodian.Name}
              label="Custodian Name"
              placeholder="Enter custodian name"
              generalErrorMessage="Please enter a custodian name"
              disabled={false}
            />
            <InputField
              onChange={(value) => {
                try {
                  const bytes = new TextEncoder().encode(value);
                  setNewCustodian({
                    ...newCustodian,
                    BtcPublicKey: bytes,
                  });
                  setBtcPublicKeyInput(value);
                } catch (e) {
                  console.error("Invalid BTC Public Key:", e);
                }
              }}
              reset={false}
              initValue={btcPublicKeyInput}
              label="BTC Public Key"
              placeholder="Enter BTC public key"
              generalErrorMessage="Please enter a valid BTC public key"
              disabled={false}
            />
            <InputField
              onChange={(value) =>
                setNewCustodian({ ...newCustodian, Description: value })
              }
              reset={false}
              initValue={newCustodian.Description}
              label="Description"
              placeholder="Enter custodian description"
              generalErrorMessage="Please enter a description"
              disabled={false}
            />
            <button
              className="btn-secondary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5"
              onClick={handleAddCustodian}
            >
              Add Custodian
            </button>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};
