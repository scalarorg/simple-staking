import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { networks } from "bitcoinjs-lib";
import Link from "next/link";
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
import { DApp as DAppInterface } from "@/app/types/dApps";
import { ProjectENV } from "@/env";
import { mempoolWebTxUrl } from "@/utils/mempool_api";
import { Network, UnisatOptions } from "@/utils/wallet/wallet_provider";

import { getPsbtByHex } from "vault/index";

import { GeneralModal } from "./GeneralModal";
import { SignTxModal } from "./SignTxModal";

type signedPsbtFunctionType =
  | ((psbt: string) => Promise<string>)
  | ((
      psbt: string,
      options?: UnisatOptions,
      privateKey?: string,
    ) => Promise<string>)
  | undefined;

interface SendTxModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  btcAddress: string | undefined;
  btcPublicKey: string | undefined;
  btcWalletNetwork: networks.Network | undefined;
  signPsbt: signedPsbtFunctionType;
  dApp?: DAppInterface;
}

const FormSchema = z.object({
  sourceChainAddress: z.string({
    required_error: "Please enter your source chain address.",
  }),
  sourceChainPublicKey: z.string({
    required_error: "Please enter your source chain public key.",
  }),
  destinationChainId: z.string({
    required_error: "Please select a chain.",
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
});

export const MintTxModal: React.FC<SendTxModalProps> = ({
  open,
  onClose,
  btcAddress,
  btcPublicKey,
  btcWalletNetwork,
  dApp,
  signPsbt,
}) => {
  const network = ProjectENV.NEXT_PUBLIC_NETWORK;
  const [signTxModalOpen, setSignTxModalOpen] = useState(false);
  const [isSignConfirm, setIsSignConfirm] = useState<any>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceChainAddress: "",
      sourceChainPublicKey: "",
      destinationChainId: "",
      tokenReceiverAddress: "",
      smartContractAddress: "",
      stakingAmount: Number(ProjectENV.NEXT_PUBLIC_STAKING_AMOUNT || 0),
      mintingAmount: Number(ProjectENV.NEXT_PUBLIC_MINTING_AMOUNT || 0),
      servicePublicKey: ProjectENV.NEXT_PUBLIC_SERVICE_PUBKEY || "",
    },
  });

  // TODO: Change minting amount according to exchange rate later when we have the necessary API
  const watchStakingAmount = useWatch({
    control: form.control,
    name: "stakingAmount",
  });

  useEffect(() => {
    form.setValue("mintingAmount", watchStakingAmount);
  }, [watchStakingAmount, form]);

  const account = useAccount();
  if (account.status === "connected") {
    form.setValue("tokenReceiverAddress", account.address?.toString() || "");
  }

  useEffect(() => {
    if (btcAddress && btcPublicKey && dApp) {
      form.setValue("sourceChainAddress", btcAddress);
      form.setValue("sourceChainPublicKey", btcPublicKey);
      form.setValue("servicePublicKey", dApp.btcPk);
      form.setValue("smartContractAddress", dApp.scAddress);
      form.setValue("destinationChainId", dApp.chainId);
    }
  }, [btcAddress, btcPublicKey, dApp, form]);

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
    setSignTxModalOpen(true);
    return new Promise<boolean>((resolve) => {
      const getSignConfirm = (isConfirm: boolean) => {
        setSignTxModalOpen(false);
        resolve(isConfirm);
      };
      setIsSignConfirm(() => getSignConfirm);
    });
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      sourceChainAddress,
      sourceChainPublicKey,
      smartContractAddress,
      tokenReceiverAddress,
      destinationChainId,
      stakingAmount,
      mintingAmount,
      servicePublicKey,
    } = data;

    try {
      if (!btcWalletNetwork) {
        throw new Error("Unsupported network");
      }

      const url = window.location.origin;

      const unsignedPsbtResult = await axios.post(`${url}/api/mint-tx-psbt`, {
        sourceChainAddress,
        sourceChainPublicKey,
        destinationChainId,
        smartContractAddress,
        tokenReceiverAddress,
        stakingAmount,
        mintingAmount,
        servicePublicKey,
      });

      const unsignedVaultPsbtHex =
        unsignedPsbtResult?.data?.data?.unsignedVaultPsbtHex;

      if (!unsignedVaultPsbtHex) {
        throw new Error(
          "Failed to get the unsigned psbt: " + unsignedPsbtResult?.data?.error,
        );
      }

      // Simulate signing
      const hexSignedPsbt = await signPsbtUsingWallet(
        unsignedVaultPsbtHex,
        signPsbt,
        {
          autoFinalized: true,
        },
      );

      if (!hexSignedPsbt) {
        throw new Error("Failed to sign the psbt");
      }

      const signedPsbt = getPsbtByHex(hexSignedPsbt, sourceChainAddress);

      // --- Sign with staker
      const hexTxFromPsbt = signedPsbt.extractTransaction().toHex();

      // UNISAT have api for user to sign this psbt and finalize it
      // this demo: https://demo.unisat.io/
      // It support sign psbt, push psbt or push tx to bitcoin network

      // Test mempool acceptance
      // const result = await axios.post(`${url}/api/test-transaction`, {
      //   hexTxFromPsbt,
      // });
      // toast({
      //   title: "Test mempool acceptance",
      //   description: (
      //     <pre className="mt-2 w-[640px] rounded-md bg-slate-950 p-4">
      //       <code className="text-white">
      //         {JSON.stringify(result.data, null, 2)}
      //       </code>
      //     </pre>
      //   ),
      // });

      // Send to bitcoin network
      // await utils.node.sendToBitcoinNetwork(ProjectENV.url!, hexTxfromPsbt);
      const result = await axios.post(`${url}/api/broadcast-btc-transaction`, {
        hexTxFromPsbt,
      });

      onClose(false);

      toast({
        title: "Mint sBTC transaction sent successfully",
        description: (
          <div className="mt-2 w-[640px] rounded-md bg-slate-950">
            <p className="text-white">
              Txid:{" "}
              <Link
                className="text-blue-500 underline"
                href={mempoolWebTxUrl(result.data.data)}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                {result.data.data.slice(0, 8)}...{result.data.data.slice(-8)}{" "}
                (click to view)
              </Link>
            </p>
          </div>
        ),
      });
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
      <GeneralModal open={open} big onClose={onClose}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">Mint Token</h3>
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => onClose(false)}
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
                  <Input disabled value={"Bitcoin"} />
                </div>

                <FormField
                  control={form.control}
                  name="sourceChainAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500">
                        Source chain address
                      </FormLabel>
                      <FormControl>
                        <Input disabled placeholder="" {...field} />
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
                          // disabled
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
                  <Input disabled value={dApp?.chainName} />
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
                  control={form.control}
                  name="mintingAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minting amount</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          step="any"
                          type="number"
                          placeholder=""
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2 py-3">
              <h3 className="text-base font-medium">dApp infomation</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="servicePublicKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BTC Service Pubkey</FormLabel>
                      <FormControl>
                        <Input disabled placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smartContractAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smart contract address</FormLabel>
                      <FormControl>
                        <Input disabled placeholder="" {...field} />
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
      <SignTxModal
        open={signTxModalOpen}
        onClose={setSignTxModalOpen}
        onSign={isSignConfirm}
        stakerAddress={form.getValues("sourceChainAddress")}
        stakingAmount={form.getValues("stakingAmount")}
        tokenReceiveAddress={form.getValues("tokenReceiverAddress")}
        tokenAmount={form.getValues("mintingAmount")}
      />
    </>
  );
};
