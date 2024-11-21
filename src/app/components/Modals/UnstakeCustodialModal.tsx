"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Psbt } from "bitcoinjs-lib";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
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
import { TransactionRateSelect } from "@/app/components/ui/TransactionRateSelect";
import { toast } from "@/app/components/ui/use-toast";
import { useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useERC20Contract } from "@/app/hooks/useContracts";
import { useExchangeRate } from "@/app/hooks/useExchangeRate";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useUnstakeCustodialModal } from "@/app/stores/modal";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { parseUnits } from "ethers";
import { GeneralModal } from "./GeneralModal";

const MOCK_ZERO_BYTES = "0x0000000000000000000000000000000000000000";

// Define your form schema
const FormSchema = z.object({
  btcReceiverAddress: z
    .string({
      required_error: "Please enter your btc receiver address.",
    })
    .min(12, "Invalid BTC address"),
  unstakeAmount: z
    .string({
      required_error: "Please enter unstake amount.",
    })
    .min(1, "Amount must be greater than 0"),
  mintFeeRate: z.string().default("hourFee"),
  customFeeRate: z.coerce
    .number()
    .int("Please enter a whole number.")
    .positive("Please enter a positive number.")
    .optional(),
});

export const UnstakeCustodialModal: React.FC = () => {
  const { address } = useAccount();
  const { isOpen, close, dApp } = useUnstakeCustodialModal();
  const { address: btcAddress, pubkey: stakerPubkey } = useWalletInfo();

  const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
    useWalletProvider();

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const feeRates = useFeeRates(isOpen, address, mempoolClient);

  const {
    sBTC,
    protocol,
    sbtcBalance,
    allowance,
    refetchAllowance,
    approve,
    unstake,
    loading,
    error,
  } = useERC20Contract(dApp!.tokenContractAddress, dApp!.scAddress, address!);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      btcReceiverAddress: btcAddress,
      unstakeAmount: "",
      mintFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  useEffect(() => {
    if (!form.getValues("btcReceiverAddress")) {
      form.setValue("btcReceiverAddress", btcAddress);
    }
  }, [btcAddress, form]);

  const vault = useVault();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!dApp) return;
    const { btcReceiverAddress, unstakeAmount, mintFeeRate, customFeeRate } =
      data;
    try {
      if (!walletProvider) {
        throw new Error("Wallet provider not found");
      }
      if (!sBTC) {
        throw new Error("sBTC contract not found");
      }
      if (!protocol) {
        throw new Error("Protocol contract not found");
      }

      if (
        Number(sbtcBalance) <= 0 ||
        Number(sbtcBalance) < Number(unstakeAmount)
      ) {
        throw new Error("Insufficient balance");
      }

      const burnAmount = parseUnits(unstakeAmount, 0);
      if (!burnAmount) {
        throw new Error("Invalid burn amount");
      }

      const btcReturnAmount = useExchangeRate(dApp, unstakeAmount);

      const addressUtxos = await walletProvider.getUtxos(
        dApp.custodialGroup.BtcAddress,
        btcReturnAmount,
      );

      const mappedAddressUtxos = addressUtxos.map((utxo) => ({
        script_pubkey: Uint8Array.from(Buffer.from(utxo.scriptPubKey, "hex")),
        txid: utxo.txid,
        vout: utxo.vout,
        value: BigInt(utxo.value),
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

      setIsProcessing(true);
      setStatus("Processing unstake request...");

      // TODO: APPLY NEW UNSTAKING CUSTODIAL LOGIC HERE
      const btcUserPk = scalarVaultModule.hexToBytes(
        stakerPubkey.replace("0x", ""),
      );
      const btcServicePk = scalarVaultModule.hexToBytes(
        dApp.btcPk.replace("0x", ""),
      );

      const numberOfCustodialPubkeys = dApp.custodialGroup.Custodials.length;
      const custodial_pubkeys_uint8array = new Uint8Array(
        33 * numberOfCustodialPubkeys,
      );

      for (let i = 0; i < numberOfCustodialPubkeys; i++) {
        custodial_pubkeys_uint8array.set(
          scalarVaultModule.hexToBytes(
            dApp.custodialGroup.Custodials[i].BtcPublicKeyHex!.replace(
              "0x",
              "",
            ),
          ),
          i * 33,
        );
      }

      const unsignedVaultPsbt =
        vault.buildUnsignedUnstakingWithOnlyCovenantsPsbt({
          inputs: mappedAddressUtxos,
          output: {
            value: BigInt(btcReturnAmount),
            script: toOutputScript(btcReceiverAddress, btcNetwork),
          },
          stakerPubkey: btcUserPk,
          protocolPubkey: btcServicePk,
          covenantPubkeys: custodial_pubkeys_uint8array,
          covenantQuorum: dApp.custodialGroup.Quorum,
          haveOnlyCovenants: true,
          rbf: true,
        });

      const hexPsbt = scalarVaultModule.bytesToHex(unsignedVaultPsbt);

      if (!allowance || Number(allowance) < Number(burnAmount)) {
        setStatus("Approving the token");

        await approve(burnAmount);

        await refetchAllowance();

        setStatus("Approval transaction mined");
      }

      setStatus("Burning the token");

      const psbt = Psbt.fromHex(hexPsbt).toBase64();

      setStatus("Unstaking the token");

      await unstake(dApp.chainId, burnAmount, psbt);

      setStatus("Token unstaked successfully");
      close();
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

  return (
    <GeneralModal open={isOpen} onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Unstake Custodial</h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <IoMdClose size={24} />
        </button>
      </div>

      {address ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <FormLabel>Token Smart Contract Address</FormLabel>
                <Input readOnly value={dApp?.tokenContractAddress || ""} />
              </div>
              <div className="space-y-2">
                <FormLabel>Custodial Group Name</FormLabel>
                <Input readOnly value={dApp?.custodialGroup.Name} />
              </div>
              <div className="space-y-2">
                <FormLabel>
                  Custodials ({dApp?.custodialGroup.Quorum} of{" "}
                  {dApp?.custodialGroup.Custodials.length} required)
                </FormLabel>
                <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border border-input bg-background p-2">
                  {dApp?.custodialGroup.Custodials.map((custodial, index) => (
                    <div
                      key={index}
                      className="flex flex-col space-y-1 text-sm"
                    >
                      <div className="font-medium">Custodial #{index + 1}</div>
                      <div className="text-muted-foreground">
                        BTC Public Key: {custodial.BtcPublicKeyHex}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel className="text-gray-500">Ethereum Address</FormLabel>
              <Input readOnly value={address} />
            </div>

            <div className="space-y-2">
              <FormLabel className="text-gray-500">
                Available sBTC Balance
              </FormLabel>
              <Input readOnly value={sbtcBalance?.toString() || "0"} />
            </div>

            <FormField
              control={form.control}
              name="unstakeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unstake Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="btcReceiverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BTC Receiver Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter BTC address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mintFeeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction fee rate</FormLabel>
                  <TransactionRateSelect
                    control={form.control}
                    feeRates={feeRates}
                  />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-4">
              {isProcessing && <Loader2 size={32} className="animate-spin" />}
              {status && <div className="max-w-md break-words">{status}</div>}
            </div>

            {!isProcessing && (
              <div className="flex justify-end">
                <Button variant="outline" type="submit">
                  Unstake
                </Button>
              </div>
            )}
          </form>
        </Form>
      ) : (
        <div>Please connect your wallet</div>
      )}
    </GeneralModal>
  );
};
