import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useConnect } from "wagmi";

import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useTransferModal } from "@/app/stores/modal";
import { ProtocolChain } from "@/app/types/protocol";

import { GeneralModal } from "../GeneralModal";

import { DestinationChainSection } from "./DestinationChainSection";
import { FormSchema, TransferFormData } from "./schema";
import { SourceChainSection } from "./SourceChainSection";
import { MOCK_TOKEN_ADDRESS } from "./utils";

export const TransferModal = () => {
  const form = useForm<TransferFormData>({
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
  const { address: evmAddress, connector } = useAccount();
  const { connect, connectors } = useConnect();

  const [selectedDestChain, setSelectedDestChain] =
    useState<ProtocolChain | null>(null);
  const [selectedSourceChain, setSelectedSourceChain] =
    useState<ProtocolChain | null>(null);

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");

  const sourceTokenAddress =
    selectedSourceChain?.supported_chain.address || MOCK_TOKEN_ADDRESS;

  // Update selected chains when form values change
  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      setSelectedSourceChain(null);
      return;
    }
    const chain = protocol.chains.find(
      (c: ProtocolChain) => c.chain_name === watchSourceChain,
    );
    setSelectedSourceChain(chain || null);
  }, [watchSourceChain, protocol]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      setSelectedDestChain(null);
      return;
    }
    const chain = protocol.chains.find(
      (c: ProtocolChain) => c.chain_name === watchDestinationChain,
    );
    setSelectedDestChain(chain || null);
  }, [watchDestinationChain, protocol]);

  const handleSubmit = async (data: TransferFormData) => {
    if (!protocol) return;
    try {
      // Implement your transfer logic here
      //   await sendToken({
      //     destinationChain: data.destinationChain,
      //     destRecipientAddress: data.destRecipientAddress,
      //     transferAmount: data.transferAmount,
      //   });
      toast({ title: "Transfer transaction successful" });
      close();
    } catch (error) {
      console.error({ error });
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <GeneralModal open={isOpen} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Transfer token</h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <XIcon size={24} />
        </button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex gap-4 w-full">
            <SourceChainSection
              form={form}
              protocol={protocol}
              selectedSourceChain={selectedSourceChain}
              sourceTokenAddress={sourceTokenAddress}
            />
            <DestinationChainSection
              form={form}
              protocol={protocol}
              selectedDestChain={selectedDestChain}
              evmAddress={evmAddress}
              onConnectWallet={() =>
                connect({ connector: connector || connectors[0] })
              }
              watchTransferAmount={watchTransferAmount}
            />
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
