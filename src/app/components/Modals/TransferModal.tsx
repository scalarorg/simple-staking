"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ERC20TokenMetadata } from "scalarjs-sdk/dist/types";
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
import { toast } from "@/app/components/ui/use-toast";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useGateway } from "@/app/hooks/useGateway";
import { useTransferModal } from "@/app/stores/modal";
import { ProtocolChain } from "@/app/types/protocol";

import { GeneralModal } from "./GeneralModal";

const MOCK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000123";
const GATEWAY_CONTRACT_ADDRESS = "0x18B625B800AB4D641e68Ade0aa5Fb61a85Fe923B";

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

const isEvmChain = (chain: ProtocolChain | null) => {
  if (!chain) return false;
  return chain.supported_chain.token.oneofKind === "erc20";
};

const isBtcChain = (chain: ProtocolChain | null) => {
  if (!chain) return false;
  return chain.supported_chain.token.oneofKind === "btc";
};

export const TransferModal = () => {
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

  const { isOpen, close, protocol } = useTransferModal();
  const { address } = useWalletInfo();
  const { address: evmAddress } = useAccount();

  const watchTransferAmount = useWatch({
    control: form.control,
    name: "transferAmount",
  });

  const [selectedDestChain, setSelectedDestChain] =
    useState<ProtocolChain | null>(null);

  const watchDestinationChain = useWatch({
    control: form.control,
    name: "destinationChain",
  });

  const [selectedSourceChain, setSelectedSourceChain] =
    useState<ProtocolChain | null>(null);

  const watchSourceChain = useWatch({
    control: form.control,
    name: "sourceChain",
  });

  const sourceTokenAddress = useMemo(() => {
    return isEvmChain(selectedSourceChain) &&
      selectedSourceChain!.supported_chain.token.oneofKind === "erc20"
      ? Buffer.from(
          (
            selectedSourceChain!.supported_chain.token
              .erc20 as ERC20TokenMetadata
          ).tokenAddress,
          "utf-8",
        ).toString("hex")
      : MOCK_TOKEN_ADDRESS;
  }, [selectedSourceChain]);

  const destTokenAddress = useMemo(() => {
    const address =
      isEvmChain(selectedDestChain) &&
      selectedDestChain!.supported_chain.token.oneofKind === "erc20"
        ? Buffer.from(
            (
              selectedDestChain!.supported_chain.token
                .erc20 as ERC20TokenMetadata
            ).tokenAddress,
            "utf-8",
          ).toString("hex")
        : MOCK_TOKEN_ADDRESS;

    return address;
  }, [selectedDestChain]);

  console.log({ selectedDestChain, destTokenAddress });

  const { sendToken, isConfirming, isConfirmed, isPending, error } = useGateway(
    {
      contractAddress: GATEWAY_CONTRACT_ADDRESS,
    },
  );

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!protocol) return;

    // TODO: use sendToken here....

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
          onSubmit={form.handleSubmit(onSubmit)}
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
                        ? evmAddress
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
                    <FormLabel>Transfer amount</FormLabel>
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

              {sourceTokenAddress && (
                <div className="space-y-2">
                  <FormLabel>Token address</FormLabel>
                  <Input readOnly value={sourceTokenAddress} />
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
                    <FormLabel>Recipient address</FormLabel>
                    <div className="flex gap-2 items-center">
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
                              evmAddress || "",
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
                        <Wallet className="w-4 h-4 text-orange-400" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {destTokenAddress && (
                <div className="space-y-2">
                  <FormLabel>Token address</FormLabel>
                  <Input readOnly value={destTokenAddress} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" type="submit">
              Transfer
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
