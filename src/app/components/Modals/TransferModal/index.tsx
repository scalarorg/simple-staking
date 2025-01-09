import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useSwitchChain } from "wagmi";

import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useGateway } from "@/app/hooks/useGateway";
import { useTransferModal } from "@/app/stores/modal";
import { ProtocolChain } from "@/app/types/protocol";

import { GeneralModal } from "../GeneralModal";

import { DestinationChainSection } from "./DestinationChainSection";
import { FormSchema, TransferFormData } from "./schema";
import { SourceChainSection } from "./SourceChainSection";
import { isBtcChain, isEvmChain } from "./utils";

export const TransferModal = () => {
  const form = useForm<TransferFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceChain: "",
      sourceChainAddress: "",
      destinationChain: "",
      destRecipientAddress: "",
      transferAmount: "100000",
      btcFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });
  const { close, protocol } = useTransferModal();
  const { address: evmAddress } = useAccount();
  const { address: btcAddress } = useWalletInfo();
  const { switchChain, error } = useSwitchChain();

  const [destChain, setDestChain] = useState<ProtocolChain | null>(null);
  const [sourceChain, setSourceChain] = useState<ProtocolChain | null>(null);

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");
  const watchSourceChainAddress = form.watch("sourceChainAddress");

  const sourceTokenAddress = sourceChain?.supported_chain.address;
  // const { client } = useScalarClient();

  // Update selected chains when form values change
  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      setSourceChain(null);
      return;
    }
    const chain = protocol.chains.find(
      (c: ProtocolChain) => c.chain_name === watchSourceChain,
    );
    setSourceChain(chain || null);
  }, [watchSourceChain, protocol]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      setDestChain(null);
      return;
    }
    const chain = protocol.chains.find(
      (c: ProtocolChain) => c.chain_name === watchDestinationChain,
    );
    setDestChain(chain || null);
  }, [watchDestinationChain, protocol]);

  useEffect(() => {
    if (!sourceChain) return;
    if (isBtcChain(sourceChain)) {
      form.setValue("sourceChainAddress", btcAddress || "");
    } else if (isEvmChain(sourceChain)) {
      form.setValue("sourceChainAddress", evmAddress || "");
    }
  }, [sourceChain, btcAddress, evmAddress, form]);

  const onConnectWallet = useCallback(() => {
    if (isEvmChain(destChain)) {
      form.setValue("destRecipientAddress", evmAddress || "");
    } else if (isBtcChain(destChain)) {
      console.log({ btcAddress });
      // not supported yet
      //   form.setValue("destRecipientAddress", btcAddress || "");
    }
  }, [evmAddress, btcAddress, form, destChain]);

  const { data: gatewayAddress } = useQuery({
    queryKey: ["gatewayAddress", sourceChain?.chain_name],
    queryFn: async () => {
      if (!sourceChain) return;
      if (!isEvmChain(sourceChain)) return;
      // const gatewayAddress = await client.getGatewayAddressForChain(
      //   sourceChain.chain_name,
      // );
      // return gatewayAddress;
    },
    enabled: !!sourceChain && isEvmChain(sourceChain),
  });

  const { sendToken } = useGateway();

  const sendEVMToEVM = useCallback(
    async (data: TransferFormData) => {
      if (!sourceTokenAddress) return;
      if (!gatewayAddress) return;
      sendToken({
        destinationChain: data.destinationChain,
        destinationAddress: data.destRecipientAddress,
        symbol: sourceTokenAddress,
        amount: BigInt(data.transferAmount),
        gatewayAddress: gatewayAddress,
      });
    },
    [sendToken, sourceTokenAddress, gatewayAddress],
  );

  const handleSubmit = async (data: TransferFormData) => {
    if (!protocol || !sourceChain || !destChain) return;
    try {
      switch (true) {
        case isEvmChain(sourceChain) && isEvmChain(destChain):
          await sendEVMToEVM(data);
          break;
        // case isBtcChain(sourceChain) && isEvmChain(destChain):
        //   await sendBtcToEvm(data);
        //   break;
        // case isEvmChain(sourceChain) && isBtcChain(destChain):
        //   await sendEvmToBtc(data);
        //   break;
        default:
          throw new Error("Unsupported chain");
      }

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
    <GeneralModal open={true} big onClose={close}>
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
              selectedSourceChain={sourceChain}
              sourceTokenAddress={sourceTokenAddress}
              sourceChainAddress={watchSourceChainAddress}
            />
            <DestinationChainSection
              form={form}
              protocol={protocol}
              selectedDestChain={destChain}
              onConnectWallet={onConnectWallet}
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
