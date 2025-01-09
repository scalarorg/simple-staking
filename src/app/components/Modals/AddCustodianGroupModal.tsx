// import { Label } from "@radix-ui/react-label";
// import { useQuery } from "@tanstack/react-query";
// import { XIcon } from "lucide-react";
// import { useState } from "react";
// import { CustodianStatus } from "@scalar-lab/scalarjs-sdk/dist/types";

// import { GeneralModal } from "@/app/components/Modals/GeneralModal";
// import { InputField } from "@/app/components/Staking/Form/InputField";
// import { SelectField } from "@/app/components/Staking/Form/SelectField";
// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { useScalarVaultModule } from "@/app/context/VaultContext";
// import { useAddCustodianGroupModal } from "@/app/stores/modal";
// import { Custodian, CustodianGroup } from "@/app/types/custodians";

// export const AddCustodianGroupModal: React.FC<{}> = () => {
//   const scalarVaultModule = useScalarVaultModule();
//   const scalarClient = useScalarClient();

//   const { isOpen, close } = useAddCustodianGroupModal();
//   const [btcNetwork, setBtcNetwork] = useState("");
//   const [custodianGroupName, setCustodianGroupName] = useState("");
//   const [quorum, setQuorum] = useState<number>(0);
//   const [taprootAddress, setTaprootAddress] = useState("");
//   const [custodians, setCustodians] = useState<Custodian[]>([]);
//   const [currentCustodian, setCurrentCustodian] = useState<Custodian>({
//     Name: "",
//     Status: CustodianStatus.ACTIVATED,
//     BtcPublicKey: new Uint8Array(),
//     Description: "",
//   });
//   const [btcPublicKeyInput, setBtcPublicKeyInput] = useState("");

//   const { data: availableBtcNetworks } = useQuery({
//     queryKey: ["getAvailableBtcNetworks"],
//     queryFn: () => scalarClient.client.getAvailableBtcNetworks(),
//     enabled: isOpen,
//     retry: (failureCount, error) => {
//       return failureCount <= 3;
//     },
//     refetchInterval: 60000,
//   });

//   const handleCustodianGroupChange = (value: string) => {
//     setCustodianGroupName(value);
//   };

//   const handleAddCustodian = () => {
//     // Validate required fields
//     if (!currentCustodian.Name || currentCustodian.BtcPublicKey.length === 0) {
//       console.error("Name and BTC Public Key are required");
//       return;
//     }

//     // Add the new custodian
//     setCustodians([...custodians, currentCustodian]);

//     // Reset the form fields
//     setCurrentCustodian({
//       Name: "",
//       Status: CustodianStatus.ACTIVATED,
//       BtcPublicKey: new Uint8Array(),
//       Description: "",
//     });

//     // Clear the BTC Public Key input field
//     setBtcPublicKeyInput("");
//   };

//   const handleAdd = async () => {
//     const requiredFields = [
//       { value: custodianGroupName, name: "Custodian Group Name" },
//       { value: btcNetwork, name: "BTC Network" },
//       { value: taprootAddress, name: "Taproot Address" },
//       { value: quorum, name: "Quorum" },
//       { value: custodians.length, name: "Custodians" },
//     ];

//     // Check for missing required fields
//     const missingFields = requiredFields.filter((field) => !field.value);
//     if (missingFields.length > 0) {
//       console.error(
//         "Missing required fields:",
//         missingFields.map((f) => f.name).join(", "),
//       );
//       return;
//     }

//     try {
//       const newCustodianGroup: CustodianGroup = {
//         UID: "",
//         Name: custodianGroupName,
//         BtcPublicKey: taprootAddress,
//         Quorum: quorum,
//         Status: CustodianStatus.ACTIVATED,
//         Description: "",
//         Custodians: custodians,
//       };

//       // TODO: Replace with actual API call
//       // await createCustodianGroup(newCustodianGroup);

//       console.log("Successfully added Custodian Group", newCustodianGroup);
//       close();
//     } catch (error) {
//       console.error("Failed to add custodian group:", error);
//     }
//   };

//   return (
//     <GeneralModal open={isOpen} onClose={close} big>
//       <div className="mb-4 flex items-center justify-between">
//         <h3 className="font-bold">Add Custodian Group</h3>
//         <button
//           className="btn btn-circle btn-ghost btn-sm"
//           onClick={() => close()}
//         >
//           <XIcon size={24} />
//         </button>
//       </div>
//       <div className="flex flex-1 flex-col">
//         {/* Custodian Group Information */}
//         <div className="mb-2 font-semibold text-center">
//           Custodian Group Information
//         </div>
//         <div className="flex flex-1 flex-col">
//           <InputField
//             onChange={handleCustodianGroupChange}
//             reset={false}
//             initValue=""
//             label="Custodian Group Name"
//             placeholder="Enter Custodian Group name"
//             generalErrorMessage="Please enter a Custodian Group name"
//             disabled={false}
//           />
//           <SelectField
//             onChange={setBtcNetwork}
//             reset={false}
//             initValue=""
//             options={availableBtcNetworks || []}
//             label="BTC Network"
//             placeholder="Select BTC Network"
//             errorMessage="Please select a BTC Network"
//           />
//           <InputField
//             onChange={(value) => setQuorum(parseInt(value) || 0)}
//             reset={false}
//             initValue=""
//             label="Quorum"
//             placeholder="Enter required number of custodians"
//             generalErrorMessage="Please input quorum number"
//             disabled={false}
//           />
//         </div>

//         {/* Custodian Information */}
//         <div className="mb-2 font-semibold text-center mt-4">
//           Custodian Information
//         </div>
//         <div className="flex flex-1 flex-col">
//           <InputField
//             onChange={(value) =>
//               setCurrentCustodian({ ...currentCustodian, Name: value })
//             }
//             reset={false}
//             initValue={currentCustodian.Name}
//             label="Custodian Name"
//             placeholder="Enter custodian name"
//             generalErrorMessage="Please enter a custodian name"
//             disabled={false}
//           />
//           <InputField
//             onChange={(value) => {
//               try {
//                 const bytes = new TextEncoder().encode(value);
//                 setCurrentCustodian({
//                   ...currentCustodian,
//                   BtcPublicKey: bytes,
//                 });
//                 setBtcPublicKeyInput(value);
//               } catch (e) {
//                 console.error("Invalid BTC Public Key:", e);
//               }
//             }}
//             reset={false}
//             initValue={btcPublicKeyInput}
//             label="BTC Public Key"
//             placeholder="Enter BTC public key"
//             generalErrorMessage="Please enter a valid BTC public key"
//             disabled={false}
//           />
//           <InputField
//             onChange={(value) =>
//               setCurrentCustodian({ ...currentCustodian, Description: value })
//             }
//             reset={false}
//             initValue={currentCustodian.Description}
//             label="Description"
//             placeholder="Enter custodian description"
//             generalErrorMessage="Please enter a description"
//             disabled={false}
//           />
//         </div>

//         <button
//           className="btn-secondary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 my-4"
//           onClick={handleAddCustodian}
//         >
//           Add Custodian
//         </button>

//         <div className="space-y-2">
//           <Label className="text-gray-500">
//             Custodians ({custodians.length})
//           </Label>
//           <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
//             {custodians.length === 0 ? (
//               <div className="text-sm text-muted-foreground text-center py-2">
//                 No custodian
//               </div>
//             ) : (
//               custodians.map((custodian, index) => (
//                 <div key={index} className="flex flex-col space-y-1 text-sm">
//                   <div className="flex items-center justify-between">
//                     <div className="font-medium">Custodian #{index + 1}</div>
//                     <button
//                       className="btn btn-ghost btn-xs text-red-500 hover:text-red-700"
//                       onClick={() =>
//                         setCustodians(custodians.filter((_, i) => i !== index))
//                       }
//                     >
//                       <XIcon size={16} />
//                     </button>
//                   </div>
//                   <div className="text-muted-foreground">
//                     <div>Name: {custodian.Name}</div>
//                     <div>Description: {custodian.Description}</div>
//                     <div>
//                       BTC Public Key:{" "}
//                       {custodian.BtcPublicKey
//                         ? Buffer.from(custodian.BtcPublicKey).toString("hex")
//                         : ""}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <button
//           className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 mb-2 text-white"
//           onClick={handleAdd}
//         >
//           Add Custodian Group
//         </button>
//       </div>
//     </GeneralModal>
//   );
// };
