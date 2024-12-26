"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Psbt } from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { parseUnits } from "ethers";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import PROTOCOL_ABI from "@/abis/protocol";
import SBTC_ABI from "@/abis/sbtc";
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
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useScalarVaultModule, useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import {
  useERC20Contract,
  useProtocolContract,
} from "@/app/hooks/useContracts";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useStakeCustodianModal } from "@/app/stores/modal";
import { ProtocolChain } from "@/app/types/protocol";
import { getTaprootAddressFromLockingScript } from "@/utils/bitcoin";
import { hexStringWith0x } from "@/utils/trim";

import { GeneralModal } from "./GeneralModal";

type TransactionType = "stake" | "unstake" | "transfer" | "none";

const FormSchema = z.object({
  sourceChain: z.string({
    required_error: "Please select a source chain.",
  }),
  destinationChain: z.string({
    required_error: "Please select a destination chain.",
  }),
  destRecipientAddress: z
    .string({
      required_error: "Please enter your token receiver address.",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum address."),
  transferAmount: z.coerce
    .string({
      required_error: "Please enter the amount.",
    })
    .min(1, "Amount must be greater than 0"),
  btcFeeRate: z.string().default("hourFee"),
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
      sourceChain: "",
      destinationChain: "",
      destRecipientAddress: "",
      transferAmount: "100000",
      btcFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  const { isOpen, close, protocol } = useStakeCustodianModal();
  const { address, pubkey } = useWalletInfo();
  const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
    useWalletProvider();
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const watchTransferAmount = useWatch({
    control: form.control,
    name: "transferAmount",
  });

  const account = useAccount();

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

  const [selectedDestChain, setSelectedDestChain] =
    useState<ProtocolChain | null>(null);

  const watchDestinationChain = useWatch({
    control: form.control,
    name: "destinationChain",
  });

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      setSelectedDestChain(null);
      return;
    }

    const selectedChain = protocol.chains.find(
      (chain) => chain.chain_name === watchDestinationChain,
    );

    if (selectedChain) {
      setSelectedDestChain(selectedChain);
    } else {
      setSelectedDestChain(null);
    }
  }, [watchDestinationChain, protocol]);

  const [selectedSourceChain, setSelectedSourceChain] =
    useState<ProtocolChain | null>(null);

  const watchSourceChain = useWatch({
    control: form.control,
    name: "sourceChain",
  });

  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      setSelectedSourceChain(null);
      return;
    }

    const selectedChain = protocol.chains.find(
      (chain) => chain.chain_name === watchSourceChain,
    );

    if (selectedChain) {
      setSelectedSourceChain(selectedChain);
    } else {
      setSelectedSourceChain(null);
    }
  }, [watchSourceChain, protocol]);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("none");

  useEffect(() => {
    if (!selectedSourceChain || !selectedDestChain) {
      setTransactionType("none");
      return;
    }

    if (selectedSourceChain.supported_chain.token.oneofKind === "btc") {
      setTransactionType("stake");
    } else if (selectedDestChain.supported_chain.token.oneofKind === "btc") {
      setTransactionType("unstake");
    } else {
      setTransactionType("transfer");
    }
  }, [selectedSourceChain, selectedDestChain]);

  async function onStakeSubmit(data: z.infer<typeof FormSchema>) {
    if (!protocol) return;

    const { destRecipientAddress, transferAmount, btcFeeRate, customFeeRate } =
      data;

    try {
      if (!btcNetwork) {
        throw new Error("Unsupported network");
      }

      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }

      if (!protocol.custodian_group) {
        throw new Error("Covenant pubkeys not found");
      }

      if (!selectedDestChain) {
        throw new Error("Destination chain not found");
      }

      const addressUtxos = await walletProvider.getUtxos(
        address,
        Number(transferAmount),
      );

      if (!addressUtxos) {
        throw new Error("Failed to get utxos");
      }

      const mappedAddressUtxos = addressUtxos.map((utxo) => ({
        ...utxo,
        status: {} as any,
      }));

      const selectedFeeRate = (() => {
        switch (btcFeeRate) {
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
        protocol.custodian_group?.Custodians.length || 0;
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

      const { psbt: unsignedVaultPsbt } =
        vault.buildStakingOutputWithOnlyCovenants({
          stakingAmount: BigInt(transferAmount),
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

  // -- Unstake --
  const sourceTokenContractAddressHex = hexStringWith0x(
    selectedSourceChain?.supported_chain.token.oneofKind === "erc20"
      ? selectedSourceChain?.supported_chain.token.erc20.tokenAddress
      : "",
  );
  const sourceChainSmartContractAddress =
    selectedSourceChain?.chain_smart_contract_address ?? new Uint8Array();
  const sourceChainSmartContractAddressHex = hexStringWith0x(
    scalarVaultModule.bytesToHex(sourceChainSmartContractAddress),
  );
  const { balance, allowance, approve } = useERC20Contract(
    SBTC_ABI,
    sourceTokenContractAddressHex,
    account.address,
    sourceChainSmartContractAddressHex,
  );
  const { unstake } = useProtocolContract(
    PROTOCOL_ABI,
    sourceChainSmartContractAddressHex,
  );
  async function onUnstakeSubmit(data: z.infer<typeof FormSchema>) {
    if (!protocol || !selectedSourceChain) return;
    const { destRecipientAddress, transferAmount, btcFeeRate, customFeeRate } =
      data;
    try {
      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }

      if (Number(balance) <= 0 || Number(balance) < Number(transferAmount)) {
        throw new Error("Insufficient balance");
      }

      if (!btcNetwork) {
        throw new Error("Unsupported network or network not found");
      }

      const burnAmount = parseUnits(transferAmount, 0);
      if (!burnAmount) {
        throw new Error("Invalid burn amount");
      }

      const btcUserPk = scalarVaultModule.hexToBytes(pubkey.replace("0x", ""));
      // TODO: check if we
      const btcServicePk = new Uint8Array();

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

      // TODO: Implement exchange rate
      // const btcReturnAmount = useExchangeRate(dApp, unstakeAmount);
      const btcReturnAmount = Number(transferAmount);

      const onlyCovenantsLockingScript = vault.onlyCovenantsLockingScript({
        covenantPubkeys: custodian_pubkeys_uint8array,
        covenantQuorum: protocol?.custodian_group?.Quorum || 0,
      });

      const taprootAddress = getTaprootAddressFromLockingScript(
        onlyCovenantsLockingScript,
        btcNetwork,
      );

      const addressUtxos = await walletProvider.getUtxos(
        taprootAddress,
        btcReturnAmount,
      );

      const mappedAddressUtxos = addressUtxos.map((utxo) => ({
        script_pubkey: Uint8Array.from(Buffer.from(utxo.scriptPubKey, "hex")),
        txid: utxo.txid,
        vout: utxo.vout,
        value: BigInt(utxo.value),
      }));

      const selectedFeeRate = (() => {
        switch (btcFeeRate) {
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

      setIsProcessing(true);
      setStatus("Processing unstake request...");

      const unsignedVaultPsbt =
        vault.buildUnsignedUnstakingWithOnlyCovenantsPsbt({
          inputs: mappedAddressUtxos,
          output: {
            value: BigInt(btcReturnAmount),
            script: toOutputScript(destRecipientAddress, btcNetwork),
          },
          stakerPubkey: btcUserPk,
          protocolPubkey: btcServicePk,
          covenantPubkeys: custodian_pubkeys_uint8array,
          covenantQuorum: protocol?.custodian_group?.Quorum || 0,
          haveOnlyCovenants: true,
          feeRate: BigInt(selectedFeeRate),
          rbf: true,
        });

      const hexPsbt = scalarVaultModule.bytesToHex(unsignedVaultPsbt);

      if (!allowance || Number(allowance) < Number(burnAmount)) {
        setStatus("Approving the token");

        await approve(sourceChainSmartContractAddressHex, burnAmount);

        setStatus("Approval transaction mined");
      }

      setStatus("Burning the token");

      const psbt = Psbt.fromHex(hexPsbt).toBase64();

      setStatus("Unstaking the token");

      // btc_chain?.btc_network has value of 'bitcoin-testnet4'
      const btcNetworkType =
        scalarClient.client.getBtcChainName(selectedSourceChain);
      await unstake(btcNetworkType, burnAmount, psbt);

      setStatus("Token unstaked successfully");
      // close();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setStatus("");
    }
  }

  async function onTransferSubmit(data: z.infer<typeof FormSchema>) {
    if (!protocol) return;

    try {
      // Add your transfer logic here
      toast({
        title: "Transfer transaction successfully",
        // Add your success message
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

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    switch (transactionType) {
      case "stake":
        return onStakeSubmit(data);
      case "unstake":
        return onUnstakeSubmit(data);
      case "transfer":
        return onTransferSubmit(data);
      default:
        toast({
          title: "Error",
          description: "Invalid transaction type",
        });
    }
  };

  const feeRates = useFeeRates(isOpen, address, mempoolClient);

  return (
    <GeneralModal open={isOpen} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Transfer token</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex gap-4 w-full">
            <div className="space-y-4 w-full">
              <div className="space-y-2 -mt-2">
                <FormField
                  control={form.control}
                  name="sourceChain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source chain</FormLabel>
                      <Select value={field.value} onChange={field.onChange}>
                        <option value="" disabled>
                          Select chain
                        </option>
                        {protocol?.chains.map((chain) => (
                          <option
                            key={chain.chain_name}
                            value={chain.chain_name}
                          >
                            {chain.chain_name}
                          </option>
                        ))}
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Source chain address</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    value={
                      selectedSourceChain?.supported_chain.token.oneofKind ===
                      "erc20"
                        ? account.address
                        : selectedSourceChain?.supported_chain.token
                              .oneofKind === "btc"
                          ? address
                          : ""
                    }
                  />
                </FormControl>
              </div>

              <FormField
                control={form.control}
                name="transferAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {transactionType === "stake"
                        ? "Staking amount (sats)"
                        : transactionType === "unstake"
                          ? "Unstaking amount"
                          : "Transfer amount"}
                    </FormLabel>
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

              {selectedSourceChain?.supported_chain.token.oneofKind ===
                "erc20" && (
                <div className="space-y-2">
                  <FormLabel>Smart contract address</FormLabel>
                  <Input
                    readOnly
                    value={
                      selectedSourceChain
                        ? hexStringWith0x(
                            scalarVaultModule.bytesToHex(
                              selectedSourceChain.chain_smart_contract_address,
                            ),
                          )
                        : ""
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 w-full">
              <div className="space-y-2 -mt-2">
                <FormField
                  control={form.control}
                  name="destinationChain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination chain</FormLabel>
                      <Select value={field.value} onChange={field.onChange}>
                        <option value="" disabled>
                          Select chain
                        </option>
                        {protocol?.chains
                          .filter(
                            (chain) =>
                              chain.chain_name !==
                              form.getValues("sourceChain"),
                          )
                          .map((chain) => (
                            <option
                              key={chain.chain_name}
                              value={chain.chain_name}
                            >
                              {chain.chain_name}
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (
                            selectedDestChain?.supported_chain.token
                              .oneofKind === "erc20"
                          ) {
                            form.setValue(
                              "destRecipientAddress",
                              account.address || "",
                            );
                          } else if (
                            selectedDestChain?.supported_chain.token
                              .oneofKind === "btc"
                          ) {
                            form.setValue(
                              "destRecipientAddress",
                              address || "",
                            );
                          }
                        }}
                      >
                        Use Wallet
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {transactionType === "unstake" ? (
                <div className="space-y-2">
                  <FormLabel>Available Token Balance</FormLabel>
                  <Input readOnly value={balance?.toString() || "0"} />
                </div>
              ) : (
                <div className="space-y-2">
                  <FormLabel>Receive amount</FormLabel>
                  <Input
                    inputMode="numeric"
                    type="number"
                    placeholder=""
                    readOnly
                    value={watchTransferAmount}
                  />
                </div>
              )}

              {selectedDestChain?.supported_chain.token.oneofKind ===
                "erc20" && (
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
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="btcFeeRate"
            render={() => (
              <FormItem>
                {transactionType !== "none" &&
                  transactionType !== "transfer" && (
                    <>
                      <FormLabel>BTC fee rate</FormLabel>
                      <TransactionRateSelect
                        control={form.control}
                        feeRates={feeRates}
                      />
                    </>
                  )}
              </FormItem>
            )}
          />

          {transactionType !== "none" && transactionType !== "transfer" && (
            <div className="space-y-2 py-3">
              <h3 className="text-base font-medium">
                Custodian Group Information
              </h3>
              <div className="flex flex-col gap-4">
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
          )}

          <div className="flex justify-end">
            <Button variant="outline" type="submit">
              {transactionType === "stake"
                ? "Stake"
                : transactionType === "unstake"
                  ? "Unstake"
                  : "Transfer"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
