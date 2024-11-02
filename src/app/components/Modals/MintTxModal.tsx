"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { toast } from "@/app/components/ui/use-toast";
import { useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useMintTxModal } from "@/app/stores/modal";
import { DApp } from "@/app/types/dApps";
import { Network, UnisatOptions } from "@/utils/wallet/wallet_provider";

import { useNetwork } from "../../context/NetworkProvicer";

import { GeneralModal } from "./GeneralModal";

type signedPsbtFunctionType =
  | ((psbt: string) => Promise<string>)
  | ((
      psbt: string,
      options?: UnisatOptions,
      privateKey?: string,
    ) => Promise<string>)
  | undefined;

const FormSchema = z.object({
  sourceChainAddress: z.string({
    required_error: "Please enter your source chain address.",
  }),
  tokenReceiverAddress: z
    .string({
      required_error: "Please enter your token receiver address.",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum address."),
  smartContractAddress: z
    .string({
      required_error: "Please enter your smart contract address.",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum address."),
  stakingAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive({
      message: "Please enter a positive number.",
    }),
  mintingAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive({
      message: "Please enter a positive number.",
    }),
  servicePublicKey: z.string({
    required_error: "Please enter your service public key.",
  }),
  mintFeeRate: z.string().default("hourFee"),
  customFeeRate: z.coerce
    .number()
    .int("Please enter a whole number.")
    .positive("Please enter a positive number.")
    .optional(),
});

const MintTxModal: React.FC<{
  dApp: DApp;
}> = ({ dApp }) => {
  const [isSignConfirm, setIsSignConfirm] = useState<any>(null);

  const { isOpen, open, close } = useMintTxModal();

  const { address, pubkey } = useWalletInfo();
  // const { mempoolClient } = useWalletProvider();

  const { vaultInstance } = useVault();

  const { mempoolClient } = useWalletProvider();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceChainAddress: "",
      tokenReceiverAddress: "",
      smartContractAddress: "",
      stakingAmount: 100000,
      mintingAmount: 100000,
      servicePublicKey: "",
      mintFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  // TODO: Change minting amount according to exchange rate later when we have the necessary API
  const watchStakingAmount = useWatch({
    control: form.control,
    name: "stakingAmount",
  });

  const { network } = useNetwork();

  async function signPsbtUsingWallet(
    psbtHex: string,
    signFunction: signedPsbtFunctionType,
    options?: UnisatOptions | undefined,
  ): Promise<string | undefined> {
    if (network === Network.REGTEST) {
      return (await waitForSignConfirm?.())
        ? await signFunction?.(psbtHex, options)
        : undefined;
    } else {
      return await signFunction?.(psbtHex);
    }
  }

  const waitForSignConfirm = () => {
    open();
    return new Promise<boolean>((resolve) => {
      const getSignConfirm = (isConfirm: boolean) => {
        close();
        resolve(isConfirm);
      };
      setIsSignConfirm(() => getSignConfirm);
    });
  };

  useEffect(() => {
    form.setValue("mintingAmount", watchStakingAmount);
  }, [watchStakingAmount, form]);

  const account = useAccount();
  if (account.status === "connected") {
    form.setValue("tokenReceiverAddress", account.address?.toString() || "");
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

        console.log({ fastestFee, hourFee, minimumFee });
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      sourceChainAddress,
      smartContractAddress,
      tokenReceiverAddress,
      stakingAmount,
      mintingAmount,
      servicePublicKey,
      mintFeeRate,
      customFeeRate,
    } = data;

    try {
      if (!network) {
        throw new Error("Unsupported network");
      }

      // const unsignedPsbtResult = await axios.post(`/api/mint-tx-psbt`, {
      //   sourceChainAddress,
      //   smartContractAddress,
      //   tokenReceiverAddress,
      //   stakingAmount,
      //   mintingAmount,
      //   servicePublicKey,
      //   mintFeeRate:
      //     mintFeeRate === "custom" ? customFeeRate?.toString() : mintFeeRate,
      // });

      // const unsignedVaultPsbtHex =
      //   unsignedPsbtResult?.data?.data?.unsignedVaultPsbtHex;

      // if (!unsignedVaultPsbtHex) {
      //   throw new Error(
      //     "Failed to get the unsigned psbt: " + unsignedPsbtResult?.data?.error,
      //   );
      // }

      // Simulate signing
      //   const hexSignedPsbt = await signPsbtUsingWallet(
      //     unsignedVaultPsbtHex,
      //     walletProvider?.signPsbt,
      //     {
      //       autoFinalized: true,
      //     },
      //   );

      //   if (!hexSignedPsbt) {
      //     throw new Error("Failed to sign the psbt");
      //   }

      //   const signedPsbt = getPsbtByHex(hexSignedPsbt, sourceChainAddress);

      //   // --- Sign with staker
      //   const hexTxFuseEffecromPsbt = signedPsbt.extractTransaction().toHex();

      //   const result = await axios.post(`/api/broadcast-btc-transaction`, {
      //     hexTxFromPsbt,
      //   });

      //   if (result.data.status !== 200) {
      //     throw new Error(result.data.error);
      //   }

      //   close();

      //   toast({
      //     title: "Stake sBTC transaction successfully",
      //     description: (
      //       <div className="mt-2 w-[640px] rounded-md bg-slate-950">
      //         <p className="text-white">
      //           Txid:{" "}
      //           <Link
      //             className="text-blue-500 underline"
      //             href={mempoolWebTxUrl(result.data.data)}
      //             target="_blank"
      //             rel="noreferrer noopener nofollow"
      //           >
      //             {result.data.data.slice(0, 8)}...{result.data.data.slice(-8)}{" "}
      //             (click to view)
      //           </Link>
      //         </p>
      //       </div>
      //     ),
      //   });
    } catch (error) {
      toast({
        title: "Error",
        // @ts-ignore
        description: error?.message || "An error occurred",
      });
    }
  }

  return (
    <>
      <GeneralModal open={isOpen} big onClose={close}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Mint Token</h3>
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

                <FormField
                  name="sourceChainAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500">
                        Source chain address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          {...field}
                          readOnly
                          value={address}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  <FormLabel className="text-gray-500">
                    Destination chain
                  </FormLabel>
                  <Input readOnly value={dApp.chainName} />
                </div>

                <FormField
                  control={form.control}
                  name="tokenReceiverAddress"
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

                <FormField
                  name="mintingAmount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minting amount</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          step="any"
                          type="number"
                          placeholder=""
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <h3 className="text-base font-medium">dApp infomation</h3>
              <div className="flex flex-col gap-4">
                <FormField
                  name="servicePublicKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BTC Service Pubkey</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          {...field}
                          readOnly
                          value={dApp.btcPk}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="smartContractAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smart contract address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          {...field}
                          readOnly
                          value={dApp.scAddress}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
      {/* <SignTxModal
        open={signTxModalOpen}
        onClose={setSignTxModalOpen}
        onSign={isSignConfirm}
        stakerAddress={form.getValues("sourceChainAddress")}
        stakingAmount={form.getValues("stakingAmount")}
        tokenReceiveAddress={form.getValues("tokenReceiverAddress")}
        tokenAmount={form.getValues("mintingAmount")}
      /> */}
    </>
  );
};

export default MintTxModal;
