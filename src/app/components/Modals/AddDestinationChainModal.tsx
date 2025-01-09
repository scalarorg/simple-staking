// import { useQuery } from "@tanstack/react-query";
// import { XIcon } from "lucide-react";
// import { useState } from "react";

// import { GeneralModal } from "@/app/components/Modals/GeneralModal";
// import { InputField } from "@/app/components/Staking/Form/InputField";
// import { SelectField } from "@/app/components/Staking/Form/SelectField";
// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { useScalarVaultModule } from "@/app/context/VaultContext";
// import { useAddDestinationChainModal } from "@/app/stores/modal";
// import { AddDestinationChainRequest, TokenStatus } from "@/app/types/protocol";
// import { hexStringWithout0x } from "@/utils/trim";

// export const AddDestinationChainModal: React.FC<{}> = () => {
//   const { isOpen, close, protocol } = useAddDestinationChainModal();
//   const scalarClient = useScalarClient();
//   const scalarVaultModule = useScalarVaultModule();

//   // Form state
//   const [chainName, setChainName] = useState("");
//   const [chainType, setChainType] = useState("");
//   const [smartContractAddress, setSmartContractAddress] = useState("");
//   const [asset, setAsset] = useState("");
//   const [tokenTxHash, setTokenTxHash] = useState("");
//   const [tokenStatus, setTokenStatus] = useState(
//     TokenStatus.STATUS_UNSPECIFIED,
//   );
//   const [isExternal, setIsExternal] = useState(false);
//   const [burnerCode, setBurnerCode] = useState("");
//   const [tokenName, setTokenName] = useState("");
//   const [tokenContractAddress, setTokenContractAddress] = useState("");
//   const [selectedChainId, setSelectedChainId] = useState<string>("");
//   const [tokenSymbol, setTokenSymbol] = useState("");
//   const [tokenDecimals, setTokenDecimals] = useState("");
//   const [tokenCapacity, setTokenCapacity] = useState<string>("");

//   const { data: availableChainTypes } = useQuery({
//     queryKey: ["getAvailableChainTypes"],
//     queryFn: () => scalarClient.client.getAvailableChainTypes(),
//     enabled: isOpen,
//     retry: (failureCount, error) => {
//       return failureCount <= 3;
//     },
//     refetchInterval: 60000,
//   });

//   const { data: availableChains } = useQuery({
//     queryKey: ["getAvailableChains", chainType],
//     queryFn: () => scalarClient.client.getAvailableChainsByChainType(chainType),
//     enabled: isOpen && chainType !== "",
//     retry: (failureCount, error) => {
//       return failureCount <= 3;
//     },
//   });

//   const tokenStatusOptions = Object.entries(TokenStatus)
//     .filter(([key]) => isNaN(Number(key)))
//     .map(([key, value]) => ({
//       label: key
//         .replace("STATUS_", "")
//         .toLowerCase()
//         .replace(/^./, (str) => str.toUpperCase()),
//       value: value.toString(),
//     }));

//   const handleAdd = async () => {
//     // Validate required fields
//     const requiredFields = [
//       { value: chainName, name: "Chain Name" },
//       { value: chainType, name: "Chain Type" },
//       { value: smartContractAddress, name: "Smart Contract Address" },
//       { value: tokenName, name: "Token Name" },
//       { value: tokenSymbol, name: "Token Symbol" },
//       { value: tokenDecimals, name: "Token Decimals" },
//       { value: tokenContractAddress, name: "Token Contract Address" },
//     ];

//     const missingFields = requiredFields.filter((field) => !field.value);
//     if (missingFields.length > 0) {
//       console.error(
//         "Missing required fields:",
//         missingFields.map((f) => f.name).join(", "),
//       );
//       return;
//     }

//     try {
//       const request: AddDestinationChainRequest = {
//         protocol_name: protocol?.name || "",
//         chain_name: chainName,
//         chain_id: parseInt(selectedChainId),
//         chain_type: chainType,
//         chain_smart_contract_address: scalarVaultModule.hexToBytes(
//           hexStringWithout0x(smartContractAddress),
//         ),
//         token: {
//           asset: asset,
//           chainId: new Uint8Array(
//             Buffer.from(Number(selectedChainId).toString(16), "hex"),
//           ),
//           details: {
//             tokenName: tokenName,
//             symbol: tokenSymbol,
//             decimals: parseInt(tokenDecimals),
//             capacity: new Uint8Array(
//               Buffer.from(Number(tokenCapacity).toString(16), "hex"),
//             ),
//           },
//           tokenAddress: hexStringWithout0x(tokenContractAddress),
//           txHash: tokenTxHash,
//           status: 4,
//           isExternal: isExternal,
//           burnerCode: scalarVaultModule.hexToBytes(
//             hexStringWithout0x(burnerCode),
//           ),
//         },
//       };

//       // TODO: Replace with actual API call
//       // await scalarClient.client.addDestinationChain(request);

//       console.log("Successfully added Destination Chain", request);
//       close();
//     } catch (error) {
//       console.error("Failed to add destination chain:", error);
//     }
//   };

//   const handleChainNameChange = (chainName: string) => {
//     setChainName(chainName);
//     const selectedChain = availableChains?.chains.find(
//       (chain) => chain.chain_name === chainName,
//     );
//     setSelectedChainId(selectedChain?.chain_id.toString() || "");
//   };

//   return (
//     <GeneralModal open={isOpen} onClose={close} big>
//       <div className="mb-4 flex items-center justify-between">
//         <h3 className="font-bold">Fill in Destination Chain information!</h3>
//         <button
//           className="btn btn-circle btn-ghost btn-sm"
//           onClick={() => close()}
//         >
//           <XIcon size={24} />
//         </button>
//       </div>
//       <div className="flex flex-1 flex-col">
//         <SelectField
//           onChange={setChainType}
//           reset={false}
//           initValue=""
//           options={availableChainTypes || []}
//           label="Chain Type"
//           placeholder="Select Chain Type"
//           errorMessage="Please select a chain type"
//           disabled={false}
//         />
//       </div>
//       <div className="flex flex-1 flex-col">
//         <div className="flex flex-1 flex-col">
//           <SelectField
//             onChange={handleChainNameChange}
//             reset={false}
//             initValue=""
//             options={
//               availableChains?.chains.map((chain) => chain.chain_name) || []
//             }
//             label="Chain Name"
//             placeholder="Select Chain Name"
//             errorMessage="Please select a chain name"
//             disabled={!chainType}
//           />
//         </div>
//         {selectedChainId && (
//           <div className="mb-4 text-sm text-gray-600">
//             Chain ID: {selectedChainId}
//           </div>
//         )}
//         <div className="flex flex-1 flex-col">
//           <InputField
//             onChange={setSmartContractAddress}
//             reset={false}
//             initValue=""
//             label="Smart Contract Address"
//             placeholder="0x"
//             generalErrorMessage="Please input a smart contract address"
//             disabled={false}
//           />
//         </div>

//         <hr className="my-4 border-gray-200" />
//         <h3 className="mb-4 font-semibold">Token Information</h3>

//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex flex-col gap-4">
//             <InputField
//               onChange={setAsset}
//               reset={false}
//               initValue=""
//               label="Asset"
//               placeholder="Asset"
//               generalErrorMessage="Please input an asset"
//               disabled={false}
//             />
//             <InputField
//               onChange={setTokenContractAddress}
//               reset={false}
//               initValue=""
//               label="Token Contract Address"
//               placeholder="0x"
//               generalErrorMessage="Please input a token contract address"
//               disabled={false}
//             />
//             <InputField
//               onChange={setTokenTxHash}
//               reset={false}
//               initValue=""
//               label="Token Tx Hash"
//               placeholder="Token Tx Hash"
//               generalErrorMessage="Please input a token tx hash"
//               disabled={false}
//             />
//             <SelectField
//               onChange={(value) => setTokenStatus(parseInt(value))}
//               reset={false}
//               initValue={TokenStatus.STATUS_UNSPECIFIED.toString()}
//               options={tokenStatusOptions.map((option) => option.label)}
//               label="Token Status"
//               placeholder="Select Token Status"
//               errorMessage="Please select a token status"
//               disabled={false}
//             />
//           </div>

//           <div className="flex flex-col gap-4">
//             <InputField
//               onChange={setTokenName}
//               reset={false}
//               initValue=""
//               label="Token Name"
//               placeholder="Token Name"
//               generalErrorMessage="Please input a token name"
//               disabled={false}
//             />
//             <InputField
//               onChange={setTokenSymbol}
//               reset={false}
//               initValue=""
//               label="Token Symbol"
//               placeholder="Token Symbol"
//               generalErrorMessage="Please input a token symbol"
//               disabled={false}
//             />
//             <InputField
//               onChange={setTokenDecimals}
//               reset={false}
//               initValue=""
//               label="Token Decimals"
//               placeholder="18"
//               generalErrorMessage="Please input token decimals"
//               disabled={false}
//             />
//             <InputField
//               onChange={setTokenCapacity}
//               reset={false}
//               initValue=""
//               label="Token Capacity"
//               placeholder="Token Capacity"
//               generalErrorMessage="Please input token capacity"
//               disabled={false}
//             />
//           </div>

//           <div className="col-span-2">
//             <InputField
//               onChange={setBurnerCode}
//               reset={false}
//               initValue=""
//               label="Burner Code"
//               placeholder="Burner Code"
//               generalErrorMessage="Please input a burner code"
//               disabled={false}
//             />
//             <div className="form-control mt-4">
//               <label className="label">
//                 <span className="label-text">Is External</span>
//               </label>
//               <input
//                 type="checkbox"
//                 className="checkbox"
//                 checked={isExternal}
//                 onChange={(e) => setIsExternal(e.target.checked)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <button
//           className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-5 mb-2 text-white"
//           onClick={handleAdd}
//         >
//           Add
//         </button>
//       </div>
//     </GeneralModal>
//   );
// };
