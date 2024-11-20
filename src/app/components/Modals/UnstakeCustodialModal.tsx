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
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useProtocolContract, useSBTCContract } from "@/app/hooks/useContracts";
import { useExchangeRate } from "@/app/hooks/useExchangeRate";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useSBTCAllowance } from "@/app/hooks/useSBTCAllowance";
import { useSBTCBalance } from "@/app/hooks/useSBTCBalance";
import { useUnstakeCustodialModal } from "@/app/stores/modal";
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
  const { address: btcAddress } = useWalletInfo();

  const { mempoolClient, walletProvider, btcNetwork, networkConfig } =
    useWalletProvider();

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const feeRates = useFeeRates(isOpen, address, mempoolClient);

  const sBTC = useSBTCContract(dApp ?? null);
  const protocol = useProtocolContract(dApp ?? null);
  const sbtcBalance = useSBTCBalance({
    contractAddress: dApp?.tokenContractAddress as `0x${string}`,
    userAddress: address,
  });
  const { allowance, refetchAllowance } = useSBTCAllowance({
    dApp,
    userAddress: address,
  });

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

      setIsProcessing(true);
      setStatus("Processing unstake request...");

      // TODO: APPLY NEW UNSTAKING CUSTODIAL LOGIC HERE
      const unsignedPsbtHexString =
        "70736274ff0100520200000001be770f80f43b611db94b0d594218f4a6f9836f0f65ca0df842b6865dc7fe73910000000000fdffffff016f2600000000000016001450dceca158a9c872eb405d52293d351110572c9e000000000001012b102700000000000022512067bff357780a93826a444646aec681c4ff1f4316244478c0d611f91a75c93b8a010304000000004215c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac00a6c593bfbb1cdb988a1a9ebc4a5e31cc638de538f5155ed4a847fac4da5711f45202ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350aad201387aab21303782b17e760c670432559df3968e52cb82cc2d8f9be43a227d5dcacc021161387aab21303782b17e760c670432559df3968e52cb82cc2d8f9be43a227d5dc25018b212098a1c9f95fadf69babfe738c34897215e91707f1fdba99fa5474d93b1f0000000021162ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a25018b212098a1c9f95fadf69babfe738c34897215e91707f1fdba99fa5474d93b1f0000000001172050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0011820adaf76e5a1245ccd6434e59e56eb9b4be82ef7309cd1ecf97ea769ed4e44958f0000";
      const unsignedPsbtHex = Uint8Array.from(
        Buffer.from(unsignedPsbtHexString, "hex"),
      );
      const hexPsbt = scalarVaultModule.bytesToHex(unsignedPsbtHex);

      if (!allowance || Number(allowance) < Number(burnAmount)) {
        setStatus("Approving the token");

        const txApprove = await sBTC.approve(dApp.scAddress, burnAmount);

        setStatus("Waiting for approval transaction to be mined");

        await txApprove.wait();

        await refetchAllowance();
        setStatus("Approval transaction mined");
      }

      setStatus("Burning the token");

      const psbt = Psbt.fromHex(hexPsbt).toBase64();

      setStatus("Unstaking the token");

      // TODO: Split to hook
      const txBurn = await protocol.unstake(
        dApp.chainId, // destination chain of the unbond = source chain of the bond
        MOCK_ZERO_BYTES,
        burnAmount,
        psbt,
      );

      setStatus("Waiting for burning transaction to be mined");

      await txBurn.wait();

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
