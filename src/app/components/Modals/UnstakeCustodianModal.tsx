// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { Psbt } from "bitcoinjs-lib";
// import { toOutputScript } from "bitcoinjs-lib/src/address";
// import { parseUnits } from "ethers";
// import { Loader2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useForm, useWatch } from "react-hook-form";
// import { IoMdClose } from "react-icons/io";
// import { useAccount, useChainId, useConnect } from "wagmi";
// import { z } from "zod";

// import PROTOCOL_ABI from "@/abis/protocol";
// import SBTC_ABI from "@/abis/sbtc";
// import { Button } from "@/app/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/app/components/ui/form";
// import { Input } from "@/app/components/ui/input";
// import { Select } from "@/app/components/ui/select";
// import { TransactionRateSelect } from "@/app/components/ui/TransactionRateSelect";
// import { toast } from "@/app/components/ui/use-toast";
// import { useScalarVaultModule, useVault } from "@/app/context/VaultContext";
// import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
// import {
//   useERC20Contract,
//   useProtocolContract,
// } from "@/app/hooks/useContracts";
// import { useFeeRates } from "@/app/hooks/useFeeRates";
// import { useUnstakeCustodianModal } from "@/app/stores/modal";
// import { ProtocolChain } from "@/app/types/protocol";

// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { hexStringWith0x } from "@/utils/trim";
// import { useQuery } from "@tanstack/react-query";
// import { GeneralModal } from "./GeneralModal";

// // Define your form schema
// const FormSchema = z.object({
//   chainName: z.string({
//     required_error: "Please select a chain.",
//   }),
//   btcReceiverAddress: z
//     .string({
//       required_error: "Please enter your btc receiver address.",
//     })
//     .min(12, "Invalid BTC address"),
//   unstakeAmount: z
//     .string({
//       required_error: "Please enter unstake amount.",
//     })
//     .min(1, "Amount must be greater than 0"),
//   unstakeFeeRate: z.string().default("hourFee"),
//   customFeeRate: z.coerce
//     .number()
//     .int("Please enter a whole number.")
//     .positive("Please enter a positive number.")
//     .optional(),
// });

// export const UnstakeCustodianModal: React.FC = () => {
//   const { address, isConnected } = useAccount();
//   const { isOpen, close, protocol } = useUnstakeCustodianModal();
//   const { address: btcAddress, pubkey: stakerPubkey } = useWalletInfo();

//   const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
//     useWalletProvider();

//   const [status, setStatus] = useState<string>("");
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const [selectedDestChain, setSelectedDestChain] =
//     useState<ProtocolChain | null>(null);

//   const scalarClient = useScalarClient();

//   const { data } = useQuery({
//     enabled: !!scalarClient,
//     queryKey: ["getVersionAndTag"],
//     queryFn: () => scalarClient.client.getVersionAndTag(),
//     refetchInterval: 60000, // 1 minute
//     retry: (failureCount, error) => {
//       return failureCount <= 3;
//     },
//   });

//   const publicVersion = String(data?.version);
//   const publicTag = data?.tag;

//   const scalarVaultModule = useScalarVaultModule();
//   const vault = useVault(protocol?.service_tag, publicTag, publicVersion);

//   const btc_chain = protocol?.chains.find(
//     (chain) => chain.chain_type === "BTC",
//   );

//   const feeRates = useFeeRates(isOpen, address, mempoolClient);

//   const tokenContractAddressHex = hexStringWith0x(
//     selectedDestChain?.supported_chain.token.token_address ?? "",
//   );
//   const chainSmartContractAddress =
//     selectedDestChain?.chain_smart_contract_address ?? new Uint8Array();
//   const chainSmartContractAddressHex = hexStringWith0x(
//     scalarVaultModule.bytesToHex(chainSmartContractAddress),
//   );

//   const { balance, allowance, approve } = useERC20Contract(
//     SBTC_ABI,
//     tokenContractAddressHex,
//     address,
//     chainSmartContractAddressHex,
//   );

//   const { unstake } = useProtocolContract(
//     PROTOCOL_ABI,
//     chainSmartContractAddressHex,
//   );

//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       chainName: "",
//       btcReceiverAddress: btcAddress,
//       unstakeAmount: "",
//       unstakeFeeRate: "hourFee",
//       customFeeRate: undefined,
//     },
//   });

//   const watchChainName = useWatch({
//     control: form.control,
//     name: "chainName",
//   });

//   useEffect(() => {
//     if (!form.getValues("btcReceiverAddress")) {
//       form.setValue("btcReceiverAddress", btcAddress);
//     }
//   }, [btcAddress, form]);

//   useEffect(() => {
//     if (!protocol || !watchChainName) {
//       setSelectedDestChain(null);
//       return;
//     }

//     const selectedChain = protocol.chains.find(
//       (chain) => chain.chain_name === watchChainName,
//     );

//     if (selectedChain) {
//       setSelectedDestChain(selectedChain);
//     } else {
//       setSelectedDestChain(null);
//     }
//   }, [watchChainName, protocol]);

//   async function onSubmit(data: z.infer<typeof FormSchema>) {
//     if (!protocol || !selectedDestChain) return;
//     const { btcReceiverAddress, unstakeAmount, unstakeFeeRate, customFeeRate } =
//       data;
//     try {
//       if (!walletProvider) {
//         throw new Error("Wallet provider not found");
//       }

//       if (Number(balance) <= 0 || Number(balance) < Number(unstakeAmount)) {
//         throw new Error("Insufficient balance");
//       }

//       const burnAmount = parseUnits(unstakeAmount, 0);
//       if (!burnAmount) {
//         throw new Error("Invalid burn amount");
//       }

//       // TODO: Implement exchange rate
//       // const btcReturnAmount = useExchangeRate(dApp, unstakeAmount);
//       const btcReturnAmount = Number(unstakeAmount);

//       const addressUtxos = await walletProvider.getUtxos(
//         protocol?.custodian_group?.TaprootAddress || "",
//         btcReturnAmount,
//       );

//       const mappedAddressUtxos = addressUtxos.map((utxo) => ({
//         script_pubkey: Uint8Array.from(Buffer.from(utxo.scriptPubKey, "hex")),
//         txid: utxo.txid,
//         vout: utxo.vout,
//         value: BigInt(utxo.value),
//       }));

//       const selectedFeeRate = (() => {
//         switch (unstakeFeeRate) {
//           case "fastestFee":
//             return feeRates.fastestFee;
//           case "hourFee":
//             return feeRates.hourFee;
//           case "minimumFee":
//             return feeRates.minimumFee;
//           case "custom":
//             return customFeeRate ?? feeRates.fastestFee;
//           default:
//             return feeRates.fastestFee;
//         }
//       })();

//       setIsProcessing(true);
//       setStatus("Processing unstake request...");

//       // TODO: APPLY NEW UNSTAKING CUSTODIAN LOGIC HERE
//       const btcUserPk = scalarVaultModule.hexToBytes(
//         stakerPubkey.replace("0x", ""),
//       );
//       const btcServicePk = btc_chain?.btc_signer_pk || new Uint8Array();

//       const numberOfCustodianPubkeys =
//         protocol?.custodian_group?.Custodians.length || 0;
//       const custodian_pubkeys_uint8array = new Uint8Array(
//         33 * numberOfCustodianPubkeys,
//       );

//       for (let i = 0; i < numberOfCustodianPubkeys; i++) {
//         custodian_pubkeys_uint8array.set(
//           protocol?.custodian_group?.Custodians[i]?.BtcPublicKey ||
//             new Uint8Array(),
//           i * 33,
//         );
//       }

//       const unsignedVaultPsbt =
//         vault.buildUnsignedUnstakingWithOnlyCovenantsPsbt({
//           inputs: mappedAddressUtxos,
//           output: {
//             value: BigInt(btcReturnAmount),
//             script: toOutputScript(btcReceiverAddress, btcNetwork),
//           },
//           stakerPubkey: btcUserPk,
//           protocolPubkey: btcServicePk,
//           covenantPubkeys: custodian_pubkeys_uint8array,
//           covenantQuorum: protocol?.custodian_group?.Quorum || 0,
//           haveOnlyCovenants: true,
//           feeRate: BigInt(selectedFeeRate),
//           rbf: true,
//         });

//       const hexPsbt = scalarVaultModule.bytesToHex(unsignedVaultPsbt);

//       if (!allowance || Number(allowance) < Number(burnAmount)) {
//         setStatus("Approving the token");

//         await approve(chainSmartContractAddressHex, burnAmount);

//         setStatus("Approval transaction mined");
//       }

//       setStatus("Burning the token");

//       const psbt = Psbt.fromHex(hexPsbt).toBase64();

//       setStatus("Unstaking the token");

//       // TODO: Remove prefix when server is updated
//       // btc_chain?.btc_network has value of 'bitcoin-testnet4'
//       await unstake(btc_chain?.btc_network || "", burnAmount, psbt);

//       setStatus("Token unstaked successfully");
//       // close();
//     } catch (error: any) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description: error.message || "An error occurred",
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//       setStatus("");
//     }
//   }

//   return (
//     <GeneralModal open={isOpen} onClose={close}>
//       <div className="mb-4 flex items-center justify-between">
//         <h3 className="font-bold">Unstake Custodian</h3>
//         <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
//           <IoMdClose size={24} />
//         </button>
//       </div>

//       {address ? (
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="flex flex-col gap-4">
//               <FormField
//                 control={form.control}
//                 name="chainName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Chain</FormLabel>
//                     <Select value={field.value} onChange={field.onChange}>
//                       <option value="" disabled>
//                         Select chain
//                       </option>
//                       {protocol?.chains.map((chain) => {
//                         if (chain.chain_type === "BTC") {
//                           return null;
//                         }
//                         return (
//                           <option
//                             key={chain.chain_name}
//                             value={chain.chain_name}
//                           >
//                             {chain.chain_name}
//                           </option>
//                         );
//                       })}
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="space-y-2">
//                 <FormLabel>Custodian Group Name</FormLabel>
//                 <Input readOnly value={protocol?.custodian_group?.Name || ""} />
//               </div>
//               <div className="space-y-2">
//                 <FormLabel>
//                   Custodians ({protocol?.custodian_group?.Quorum} of{" "}
//                   {protocol?.custodian_group?.Custodians.length} required)
//                 </FormLabel>
//                 <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
//                   {protocol?.custodian_group?.Custodians.map(
//                     (
//                       custodian: { BtcPublicKey: Uint8Array },
//                       index: number,
//                     ) => (
//                       <div
//                         key={index}
//                         className="flex flex-col space-y-1 text-sm"
//                       >
//                         <div className="font-medium">
//                           Custodian #{index + 1}
//                         </div>
//                         <div className="text-muted-foreground">
//                           BTC Public Key:{" "}
//                           {scalarVaultModule.bytesToHex(custodian.BtcPublicKey)}
//                         </div>
//                       </div>
//                     ),
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <FormLabel className="text-gray-500">Ethereum Address</FormLabel>
//               <Input readOnly value={address} />
//             </div>

//             <div className="space-y-2">
//               <FormLabel className="text-gray-500">
//                 Available Token Balance
//               </FormLabel>
//               <Input readOnly value={balance?.toString() || "0"} />
//             </div>

//             <FormField
//               control={form.control}
//               name="unstakeAmount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Unstake Amount</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter amount" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="btcReceiverAddress"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>BTC Receiver Address</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter BTC address" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="unstakeFeeRate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Transaction fee rate</FormLabel>
//                   <TransactionRateSelect
//                     control={form.control}
//                     feeRates={feeRates}
//                   />
//                 </FormItem>
//               )}
//             />

//             <div className="flex items-center justify-center gap-4">
//               {isProcessing && <Loader2 size={32} className="animate-spin" />}
//               {status && <div className="max-w-md break-words">{status}</div>}
//             </div>

//             {!isProcessing && (
//               <div className="flex justify-end">
//                 <Button variant="outline" type="submit">
//                   Unstake
//                 </Button>
//               </div>
//             )}
//           </form>
//         </Form>
//       ) : (
//         <ConnectWallet />
//       )}
//     </GeneralModal>
//   );
// };

// const ConnectWallet: React.FC = () => {
//   const chainId = useChainId();
//   const { connectors, connect, status, error } = useConnect();

//   return (
//     <div className="flex flex-col gap-4 items-center">
//       <h2>Choose Ethereum Wallet</h2>
//       <div className="flex gap-2 flex-col w-full">
//         {connectors.map((connector) => (
//           <button
//             className="btn btn-gray-700 hover:bg-gray-500 transition-colors"
//             key={connector.uid}
//             onClick={() => connect({ connector, chainId })}
//             type="button"
//           >
//             {connector.name}
//           </button>
//         ))}
//       </div>
//       {status === "pending" && <Loader2 size={32} className="animate-spin" />}
//       {error?.message && <div>Error: {error.message}</div>}
//     </div>
//   );
// };
