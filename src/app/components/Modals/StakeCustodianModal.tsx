"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Psbt } from "bitcoinjs-lib";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { TransactionRateSelect } from "@/app/components/ui/TransactionRateSelect";
import { toast } from "@/app/components/ui/use-toast";
import { useScalarVaultModule, useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useStakeCustodianModal } from "@/app/stores/modal";
import { DestinationChain } from "@/app/types/protocol";
import { hexStringWith0x } from "@/utils/trim";
import Link from "next/link";
import { GeneralModal } from "./GeneralModal";

const FormSchema = z.object({
  tokenName: z.string({
    required_error: "Please select a token.",
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

export const StakeCustodianModal = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tokenName: "",
      destRecipientAddress: "",
      stakingAmount: 100000,
      mintFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  const { isOpen, close, protocol } = useStakeCustodianModal();
  const { address, pubkey } = useWalletInfo();
  const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
    useWalletProvider();

  const watchStakingAmount = useWatch({
    control: form.control,
    name: "stakingAmount",
  });

  const account = useAccount();
  if (account.status === "connected") {
    form.setValue("destRecipientAddress", account.address?.toString() || "");
  }

  const scalarVaultModule = useScalarVaultModule();
  const vault = useVault();

  const [selectedDestChain, setSelectedDestChain] =
    useState<DestinationChain | null>(null);

  const watchTokenName = useWatch({
    control: form.control,
    name: "tokenName",
  });

  useEffect(() => {
    if (!protocol || !watchTokenName) {
      setSelectedDestChain(null);
      return;
    }

    const selectedChain = protocol.dest_chains.find(
      (chain) => chain.token.details.symbol === watchTokenName,
    );

    if (selectedChain) {
      setSelectedDestChain(selectedChain);
    } else {
      setSelectedDestChain(null);
    }
  }, [watchTokenName, protocol]);

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

      if (!protocol.custodian_group.Custodians) {
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
      const destAddress = scalarVaultModule.hexToBytes(
        destRecipientAddress.replace("0x", ""),
      );

      const numberOfCustodianPubkeys =
        protocol.custodian_group.Custodians.length;
      const custodian_pubkeys_uint8array = new Uint8Array(
        33 * numberOfCustodianPubkeys,
      );

      for (let i = 0; i < numberOfCustodianPubkeys; i++) {
        custodian_pubkeys_uint8array.set(
          protocol.custodian_group.Custodians[i].BtcPublicKey,
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
        vault.buildStakingOutputWithOnlyCovenants({
          stakingAmount: BigInt(stakingAmount),
          stakerPubkey: btcUserPk,
          stakerAddress: address,
          custodialPubkeys: custodian_pubkeys_uint8array,
          covenantQuorum: protocol.custodian_group.Quorum,
          destinationChain,
          destinationContractAddress:
            selectedDestChain.chain_smart_contract_address,
          destinationRecipientAddress: destAddress,
          availableUTXOs: mappedAddressUtxos,
          feeRate: selectedFeeRate,
          rbf: true,
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
        title: "Stake transaction successfully",
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

  const feeRates = useFeeRates(isOpen, address, mempoolClient);

  return (
    <GeneralModal open={isOpen} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Stake Custodian</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
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
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <Select value={field.value} onChange={field.onChange}>
                        <option value="" disabled>
                          Select token
                        </option>
                        {protocol?.dest_chains.map((chain) => (
                          <option
                            key={chain.token.details.symbol}
                            value={chain.token.details.symbol}
                          >
                            {chain.token.details.symbol}
                          </option>
                        ))}
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
            render={() => (
              <FormItem>
                <FormLabel>Minting fee rate</FormLabel>
                <TransactionRateSelect
                  control={form.control}
                  feeRates={feeRates}
                />
              </FormItem>
            )}
          />

          <div className="space-y-2 py-3">
            <h3 className="text-base font-medium">
              Custodian Group Information
            </h3>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <FormLabel>Smart contract address</FormLabel>
                <Input
                  readOnly
                  value={
                    selectedDestChain
                      ? hexStringWith0x(
                          scalarVaultModule.bytesToHex(
                            selectedDestChain.chain_smart_contract_address,
                          ),
                        )
                      : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Custodian Group Name</FormLabel>
                <Input readOnly value={protocol?.custodian_group.Name} />
              </div>
              <div className="space-y-2">
                <FormLabel>
                  Custodians ({protocol?.custodian_group.Quorum} of{" "}
                  {protocol?.custodian_group.Custodians.length} required)
                </FormLabel>
                <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                  {protocol?.custodian_group.Custodians.map(
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
                          {scalarVaultModule.bytesToHex(custodian.BtcPublicKey)}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" type="submit">
              Stake
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
