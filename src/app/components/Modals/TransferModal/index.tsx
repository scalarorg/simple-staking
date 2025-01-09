import { zodResolver } from "@hookform/resolvers/zod";
import { isHexString } from "ethers";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import ScalarAPI from "@/apis/scalar";
import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useGateway } from "@/app/hooks/useGateway";
import { useTransferModal } from "@/app/stores/modal";
import { isSupportedChain } from "@/app/wagmi";
import { getChainID } from "@/utils/scalar/chains";

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
  const chainId = useChainId();

  const [destChain, setDestChain] = useState<TProtocolChain | null>(null);
  const [sourceChain, setSourceChain] = useState<TProtocolChain | null>(null);

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");
  const watchSourceChainAddress = form.watch("sourceChainAddress");

  const sourceTokenAddress = sourceChain?.address;
  // const { client } = useScalarClient();

  // Update selected chains when form values change
  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      setSourceChain(null);
      return;
    }
    const chain = protocol.chains?.find((c) => c.chain === watchSourceChain);
    setSourceChain(chain || null);
  }, [watchSourceChain, protocol]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      setDestChain(null);
      return;
    }
    const chain = protocol.chains?.find(
      (c) => c.chain === watchDestinationChain,
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

  useEffect(() => {
    if (!sourceChain) return;
    if (!isEvmChain(sourceChain)) return;
    if (!isSupportedChain(chainId)) return;
    const sourceChainID = getChainID(sourceChain);
    if (sourceChainID && chainId !== Number(sourceChainID)) {
      switchChain({ chainId: Number(sourceChainID) });
    }
  }, [destChain, sourceChain, chainId, switchChain]);

  const onConnectWallet = useCallback(() => {
    if (isEvmChain(destChain)) {
      form.setValue("destRecipientAddress", evmAddress || "");
    } else if (isBtcChain(destChain)) {
      console.log({ btcAddress });
      // not supported yet
      //   form.setValue("destRecipientAddress", btcAddress || "");
    }
  }, [evmAddress, btcAddress, form, destChain]);

  const { data: gateway } = ScalarAPI.useQuery(
    "get",
    `/scalar/chains/v1beta1/gateway_address/{chain}`,
    {
      params: {
        path: { chain: sourceChain?.chain ?? "" },
      },
    },
    {
      enabled: Boolean(sourceChain?.chain) && isEvmChain(sourceChain),
    },
  );

  const {
    sendToken,
    isConfirmed,
    isPending,
    hash,
    error: sendError,
    receiptError,
  } = useGateway();

  const sendEVMToEVM = useCallback(
    async (data: TransferFormData) => {
      if (!sourceTokenAddress) return;
      if (!gateway || !gateway.address) return;
      if (!isHexString(gateway.address)) return;
      if (!isEvmChain(data.destinationChain)) return;
      if (!isEvmChain(data.sourceChain)) return;

      sendToken({
        destinationChain: data.destinationChain,
        destinationAddress: data.destRecipientAddress,
        symbol: protocol?.asset?.name || "",
        amount: BigInt(data.transferAmount),
        gatewayAddress: gateway.address as THexString,
      });
    },
    [sendToken, sourceTokenAddress, gateway, protocol],
  );

  // const sendBtcToEvm = useCallback(
  //   async (data: TransferFormData) => {
  //     if (!gateway || !gateway.address) return;
  //     if (!isHexString(gateway.address)) return;
  //     if (!isBtcChain(data.sourceChain)) return;
  //     if (!isEvmChain(data.destinationChain)) return;
  //   },
  //   [sourceTokenAddress, gateway],
  // );

  const handleSubmit = async (data: TransferFormData) => {
    if (!protocol || !sourceChain || !destChain) return;
    try {
      switch (true) {
        case isEvmChain(sourceChain) && isEvmChain(destChain):
          await sendEVMToEVM(data);
          break;
        case isBtcChain(sourceChain) && isEvmChain(destChain):
          await sendBtcToEvm(data);
          break;
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

      while (!isPending) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast({
        title: "Transfer transaction successful",
        description: `Transaction hash: ${hash}`,
      });
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

  useEffect(() => {
    if (receiptError) {
      toast({
        title: "Error",
        description: receiptError.message,
      });
    }
    if (sendError) {
      toast({
        title: "Error",
        description: sendError.message,
      });
      return;
    }
  }, [receiptError, sendError]);

  useEffect(() => {
    if (isPending) {
      toast({
        title: "Transaction pending",
        description: "Waiting for sending transaction",
      });
    }

    if (isConfirmed) {
      toast({
        title: "Transaction confirmed",
        description: "Transaction has been confirmed",
      });
      close();
    }
  }, [isPending, isConfirmed, close]);

  return (
    <GeneralModal open={true} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Transfer token</h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <XIcon size={24} />
        </button>
      </div>

      {protocol && (
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
                gateway={gateway?.address || ""}
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
              <Button variant="outline" type="submit" disabled={isPending}>
                {isPending ? "Sending..." : "Transfer"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </GeneralModal>
  );
};
