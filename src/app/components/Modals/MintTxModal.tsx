"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Psbt } from "bitcoinjs-lib";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useAccount, useChainId } from "wagmi";
import { z } from "zod";

import { useScalarClient } from "@/app/context/ScalarProvider";
import { useScalarVaultModule, useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useMintTxModal } from "@/app/stores/modal";
import { ProtocolChain } from "@/app/types/protocol";
import { ExtendedProjectENV } from "@/env";
import { hexStringWith0x } from "@/utils/trim";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { toast } from "../ui/use-toast";

import { GeneralModal } from "./GeneralModal";

const FormSchema = z.object({
  chainName: z.string({
    required_error: "Please select a chain.",
  }),
  destRecipientAddress: z
    .string({
      required_error: "Please enter your token receiver address.",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum address."),
  stakingAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive({
      message: "Please enter a positive number.",
    }),
  mintFeeRate: z.string().default("hourFee"),
  customFeeRate: z.coerce
    .number()
    .int("Please enter a whole number.")
    .positive("Please enter a positive number.")
    .optional(),
});

export const MintTxModal: React.FC<{}> = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      chainName: "",
      destRecipientAddress: "",
      stakingAmount: 100000,
      mintFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  const { isOpen, open, close, protocol } = useMintTxModal();

  const { address, pubkey } = useWalletInfo();

  const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
    useWalletProvider();

  const id = useChainId();

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

  const scalarVaultModule = useScalarVaultModule();
  const vault = useVault(protocol?.service_tag, publicTag, publicVersion);

  const btc_chain = protocol?.chains.find(
    (chain) => chain.chain_type === "BTC",
  );

  const [selectedDestChain, setSelectedDestChain] =
    useState<ProtocolChain | null>(null);

  const watchChainName = useWatch({
    control: form.control,
    name: "chainName",
  });

  useEffect(() => {
    if (!protocol || !watchChainName) {
      setSelectedDestChain(null);
      return;
    }

    const selectedChain = protocol.chains.find(
      (chain) => chain.chain_name === watchChainName,
    );

    if (selectedChain) {
      setSelectedDestChain(selectedChain);
    } else {
      setSelectedDestChain(null);
    }
  }, [watchChainName, protocol]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!protocol) return;

    const { destRecipientAddress, stakingAmount, mintFeeRate, customFeeRate } =
      data;

    try {
      if (!btcNetwork) {
        throw new Error("Unsupported network");
      }

      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }

      if (!ExtendedProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS) {
        throw new Error("Covenant pubkeys not found");
      }

      if (!selectedDestChain) {
        throw new Error("Destination chain not found");
      }

      const addressUtxos = await walletProvider.getUtxos(
        address,
        stakingAmount,
      );

      if (!addressUtxos) {
        throw new Error("Failed to get utxos");
      }

      const mappedAddressUtxos = addressUtxos.map((utxo) => ({
        ...utxo,
        status: {} as any,
      }));

      const selectedFeeRate = (() => {
        switch (mintFeeRate) {
          case "fastestFee":
            return feeRates.fastestFee;
          case "hourFee":
            return feeRates.hourFee;
          case "minimumFee":
            return feeRates.minimumFee;
          case "custom":
            return customFeeRate ?? feeRates.fastestFee;
          default:
            return feeRates.fastestFee;
        }
      })();

      const btcUserPk = scalarVaultModule.hexToBytes(pubkey.replace("0x", ""));
      // TODO: add btc_signer_pk to btc support chain in Scalar-core, then replace the new Uint8Array() with btc_signer_pk
      // const btcServicePk = btc_chain?.btc_signer_pk || new Uint8Array();
      const btcServicePk = new Uint8Array();

      const destAddress = scalarVaultModule.hexToBytes(
        destRecipientAddress.replace("0x", ""),
      );
      const smartContractAddress =
        selectedDestChain.chain_smart_contract_address;

      const numberOfCustodianPubkeys =
        protocol?.custodian_group?.Custodians.length || 0;
      const custodian_pubkeys_uint8array = new Uint8Array(
        33 * numberOfCustodianPubkeys,
      );

      for (let i = 0; i < numberOfCustodianPubkeys; i++) {
        custodian_pubkeys_uint8array.set(
          protocol?.custodian_group?.Custodians[i]?.BtcPublicKey ||
            new Uint8Array(),
          i * 33,
        );
      }

      const chainType =
        scalarVaultModule.ChainType[
          selectedDestChain.chain_type as keyof typeof scalarVaultModule.ChainType
        ];
      console.log(
        "--- selectedDestChain.chain_type",
        selectedDestChain.chain_type,
      );
      console.log("--- chainType", chainType);
      const destinationChain = new scalarVaultModule.DestinationChain(
        chainType,
        BigInt(selectedDestChain.chain_id),
      );

      const { psbt: unsignedVaultPsbt, fee: estimatedFee } =
        vault.buildStakingOutput({
          stakingAmount: BigInt(stakingAmount),
          stakerPubkey: btcUserPk,
          stakerAddress: address,
          protocolPubkey: btcServicePk,
          custodialPubkeys: custodian_pubkeys_uint8array,
          covenantQuorum: protocol?.custodian_group?.Quorum || 0,
          haveOnlyCovenants: false,
          destinationChain,
          destinationContractAddress: smartContractAddress,
          destinationRecipientAddress: destAddress,
          availableUTXOs: mappedAddressUtxos,
          feeRate: selectedFeeRate,
          rbf: false,
        });

      const hexPsbt = unsignedVaultPsbt.toHex();

      const signedPsbt = await walletProvider?.signPsbt(hexPsbt, {
        autoFinalized: true,
      });

      if (!signedPsbt) {
        throw new Error("Failed to sign the psbt");
      }

      const finalizedPsbt = Psbt.fromHex(signedPsbt);

      const txHex = finalizedPsbt.extractTransaction().toHex();

      const result = await walletProvider.pushTx(txHex);

      toast({
        title: "Stake sBTC transaction successfully",
        description: (
          <div className="mt-2 w-[640px] rounded-md bg-slate-950">
            <p className="text-white">
              Txid:{" "}
              <Link
                className="text-blue-500 underline"
                href={`${networkConfig?.mempoolApiUrl}/tx/${result}`}
                target="_blank"
              >
                {result.slice(0, 8)}...{result.slice(-8)} (click to view)
              </Link>
            </p>
          </div>
        ),
      });
      close();
    } catch (error) {
      console.error({ error });
      toast({
        title: "Error",
        // @ts-ignore
        description: error?.message || "An error occurred",
      });
    }
  }

  const watchStakingAmount = useWatch({
    control: form.control,
    name: "stakingAmount",
  });

  const account = useAccount();
  if (account.status === "connected") {
    form.setValue("destRecipientAddress", account.address?.toString() || "");
  }

  const [feeRates, setFeeRates] = useState({
    fastestFee: 1,
    hourFee: 1,
    minimumFee: 1,
  });

  useEffect(() => {
    const fetchFeeRates = async () => {
      if (!mempoolClient) return;
      if (!isOpen || !address) return;
      try {
        const { fees } = mempoolClient;
        const { fastestFee, hourFee, minimumFee } =
          await fees.getFeesRecommended();

        setFeeRates({
          fastestFee,
          hourFee,
          minimumFee,
        });
      } catch (error) {
        console.warn("Error fetching fee rates:", error);
        setFeeRates({
          fastestFee: 1,
          hourFee: 1,
          minimumFee: 1,
        });
      }
    };

    fetchFeeRates();
  }, [open, address, isOpen, mempoolClient]);

  if (!protocol) return null;

  return (
    <>
      <GeneralModal open={isOpen} big onClose={close}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Stake Token</h3>
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => close()}
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="flex gap-4 w-full">
              <div className="space-y-4 w-full">
                <div className="space-y-2 -mt-2">
                  <FormLabel className="text-gray-500">Source chain</FormLabel>
                  <Input readOnly value={"Bitcoin"} />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-gray-500">
                    Source chain address
                  </FormLabel>
                  <FormControl>
                    <Input readOnly value={address} />
                  </FormControl>
                </div>

                <FormField
                  control={form.control}
                  name="stakingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staking amount (sats)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          step="any"
                          type="number"
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 w-full">
                <div className="space-y-2 -mt-2">
                  <FormField
                    control={form.control}
                    name="chainName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chain</FormLabel>
                        <Select value={field.value} onChange={field.onChange}>
                          <option value="" disabled>
                            Select chain
                          </option>
                          {protocol?.chains.map((chain) => {
                            if (chain.chain_type === "BTC") {
                              return null;
                            }
                            return (
                              <option
                                key={chain.chain_name}
                                value={chain.chain_name}
                              >
                                {chain.chain_name}
                              </option>
                            );
                          })}
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="destRecipientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token receiver address</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel>Minting amount</FormLabel>
                  <Input
                    inputMode="numeric"
                    type="number"
                    placeholder=""
                    readOnly
                    value={watchStakingAmount}
                  />
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="mintFeeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minting fee rate</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={
                          field.value === "fastestFee" ? "default" : "outline"
                        }
                        onClick={() =>
                          form.setValue("mintFeeRate", "fastestFee")
                        }
                        className="flex flex-col items-center justify-center h-auto py-2"
                      >
                        <span>Fastest</span>
                        <span className="text-sm">
                          ({feeRates.fastestFee} sat/vB)
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "hourFee" ? "default" : "outline"
                        }
                        onClick={() => form.setValue("mintFeeRate", "hourFee")}
                        className="flex flex-col items-center justify-center h-auto py-2"
                      >
                        <span>Medium</span>
                        <span className="text-sm">
                          ({feeRates.hourFee} sat/vB)
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "minimumFee" ? "default" : "outline"
                        }
                        onClick={() =>
                          form.setValue("mintFeeRate", "minimumFee")
                        }
                        className="flex flex-col items-center justify-center h-auto py-2"
                      >
                        <span>Minimum</span>
                        <span className="text-sm">
                          ({feeRates.minimumFee} sat/vB)
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value !== "fastestFee" &&
                          field.value !== "hourFee" &&
                          field.value !== "minimumFee"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => {
                          form.setValue("mintFeeRate", "custom");
                          form.setFocus("customFeeRate");
                        }}
                        className="flex items-center justify-center h-auto py-2"
                      >
                        Custom
                      </Button>
                    </div>
                    {field.value === "custom" && (
                      <FormField
                        control={form.control}
                        name="customFeeRate"
                        render={({ field: customField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...customField}
                                type="number"
                                placeholder="Custom fee rate (sat/vB)"
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  if (!isNaN(value) && value > 0) {
                                    customField.onChange(value);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2 py-3">
              <h3 className="text-base font-medium">Protocol infomation</h3>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <FormLabel>BTC Service Pubkey</FormLabel>
                  <Input
                    readOnly
                    value={scalarVaultModule.bytesToHex(
                      // btc_chain?.btc_signer_pk ?? new Uint8Array(),
                      new Uint8Array(),
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Smart contract address</FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedDestChain?.chain_smart_contract_address
                        ? hexStringWith0x(
                            scalarVaultModule.bytesToHex(
                              selectedDestChain?.chain_smart_contract_address,
                            ),
                          )
                        : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Custodian Group Name</FormLabel>
                  <Input
                    readOnly
                    value={protocol?.custodian_group?.Name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>
                    Custodians ({protocol?.custodian_group?.Quorum} of{" "}
                    {protocol?.custodian_group?.Custodians.length} required)
                  </FormLabel>
                  <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                    {protocol?.custodian_group?.Custodians.map(
                      (custodian, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-1 text-sm"
                        >
                          <div className="font-medium">
                            Custodian #{index + 1}
                          </div>
                          <div className="text-muted-foreground">
                            BTC Public Key:{" "}
                            {scalarVaultModule.bytesToHex(
                              custodian.BtcPublicKey,
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="" variant="outline" type="submit">
                Mint sBTC
              </Button>
            </div>
          </form>
        </Form>
      </GeneralModal>
    </>
  );
};
