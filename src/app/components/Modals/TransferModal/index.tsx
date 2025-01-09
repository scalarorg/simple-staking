import { zodResolver } from "@hookform/resolvers/zod";
import { isHexString } from "ethers";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { useTransferModal } from "@/app/stores/modal";
import { isSupportedChain } from "@/app/wagmi";
import { getChainID } from "@/utils/scalar/chains";

import { GeneralModal } from "../GeneralModal";

import { DestinationChainSection } from "./DestinationChainSection";
import { FormSchema, TransferFormData } from "./schema";
import { SourceChainSection } from "./SourceChainSection";
import { useGateway } from "./useGateway";
import { useSendToken } from "./useSendToken";
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

  const [destChain, setDestChain] = useState<TProtocolChain>();
  const [sourceChain, setSourceChain] = useState<TProtocolChain>();

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");
  const watchSourceChainAddress = form.watch("sourceChainAddress");

  const sourceTokenAddress = sourceChain?.address;
  const evmChains = protocol?.chains?.filter((c) => isEvmChain(c));

  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      return;
    }
    const chain = protocol.chains?.find((c) => c.chain === watchSourceChain);
    if (!chain) return;
    setSourceChain(chain);
    if (isEvmChain(chain)) {
      const otherEvmChain = evmChains?.find(
        (c: TProtocolChain) => c.chain !== chain.chain,
      );
      setDestChain(otherEvmChain);
    }
  }, [watchSourceChain, protocol, evmChains]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      return;
    }
    const chain = protocol.chains?.find(
      (c) => c.chain === watchDestinationChain,
    );
    if (!chain) return;
    setDestChain(chain);
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

  const { data: gateway } = useGateway(sourceChain?.chain);

  const {
    sendToken,
    isConfirmed,
    isPending,
    hash,
    error: sendError,
    receiptError,
  } = useSendToken();

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

      while (!isPending) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast({
        title: "Transfer transaction successful",
        description: `Transaction hash: ${hash}`,
      });
    },
    [sendToken, sourceTokenAddress, gateway, protocol, isPending, hash],
  );

  // const handleBtcToEvm = useCallback(
  //   async (data: TransferFormData) => {
  //     if (!isBtcChain(data.sourceChain))
  //       throw new Error("Invalid source chain");
  //     if (!isEvmChain(data.destinationChain))
  //       throw new Error("Invalid destination chain");
  //     if (!btcNetwork) throw new Error("Invalid BTC network");
  //     if (!protocol) throw new Error("Invalid protocol");
  //     if (!walletProvider) throw new Error("Invalid wallet provider");
  //     if (!destChain) throw new Error("Invalid destination chain");
  //     if (!destChain?.address)
  //       throw new Error("Invalid destination chain address");
  //     if (!protocol?.custodian_group?.custodians)
  //       throw new Error("Invalid custodian pubkeys");
  //     if (!protocol?.custodian_group?.quorum)
  //       throw new Error("Invalid custodian quorum");
  //     if (!btcPubkey) throw new Error("Invalid BTC pubkey");
  //     if (!btcAddress) throw new Error("Invalid BTC address");

  //     const requiredFields = {
  //       btcNetwork,
  //       protocol,
  //       walletProvider,
  //       destChain: destChain?.address,
  //       custodians: protocol?.custodian_group?.custodians,
  //       quorum: protocol?.custodian_group?.quorum,
  //       destinationChain: data.destinationChain,
  //     };

  //     // Validate all required fields exist
  //     for (const [key, value] of Object.entries(requiredFields)) {
  //       if (!value) throw new Error(`Missing required field: ${key}`);
  //     }

  //     // Get and validate UTXOs
  //     const addressUtxos = await walletProvider.getUtxos(
  //       btcAddress,
  //       Number(data.transferAmount),
  //     );
  //     if (!addressUtxos) throw new Error("Not enough UTXOs");

  //     // Prepare transaction data
  //     const txData = {
  //       utxos: addressUtxos.map((utxo) => ({ ...utxo, status: {} as any })),
  //       feeRate:
  //         data.btcFeeRate === "custom"
  //           ? (data.customFeeRate ?? feeRates.fastestFee)
  //           : feeRates.minimumFee,
  //       addresses: {
  //         btcUserPk: scalarVaultModule.hexToBytes(btcPubkey.replace("0x", "")),
  //         destinationRecipient: scalarVaultModule.hexToBytes(
  //           data.destRecipientAddress.replace("0x", ""),
  //         ),
  //         destinationToken: scalarVaultModule.hexToBytes(
  //           destChain.address.replace("0x", ""),
  //         ),
  //       },
  //     };

  //     // Prepare custodian pubkeys
  //     const custodianPubkeysBuffer = await prepareCustodianPubkeys(
  //       protocol.custodian_group.custodians,
  //     );

  //     // Build and sign transaction
  //     const chainId = getChainID(data.destinationChain);
  //     if (!chainId) throw new Error("Invalid chain ID");

  //     const destinationChain = new scalarVaultModule.DestinationChain(
  //       ChainType.EVM,
  //       BigInt(chainId),
  //     );

  //     const { psbt: unsignedVaultPsbt } =
  //       vault.buildStakingOutputWithOnlyCovenants({
  //         stakingAmount: BigInt(data.transferAmount),
  //         stakerPubkey: txData.addresses.btcUserPk,
  //         stakerAddress: btcAddress,
  //         custodialPubkeys: custodianPubkeysBuffer,
  //         covenantQuorum: protocol.custodian_group.quorum,
  //         destinationChain,
  //         destinationContractAddress: txData.addresses.destinationToken,
  //         destinationRecipientAddress: txData.addresses.destinationRecipient,
  //         availableUTXOs: txData.utxos,
  //         feeRate: txData.feeRate,
  //         rbf: true,
  //       });

  //     // Sign and broadcast transaction
  //     const signedPsbt = await walletProvider.signPsbt(
  //       unsignedVaultPsbt.toHex(),
  //       {
  //         autoFinalized: true,
  //       },
  //     );
  //     if (!signedPsbt) throw new Error("Failed to sign the PSBT");

  //     const txHex = Psbt.fromHex(signedPsbt).extractTransaction().toHex();
  //     const txId = await walletProvider.pushTx(txHex);
  //     setTxId(txId);
  //   },
  //   [
  //     vault,
  //     walletProvider,
  //     btcNetwork,
  //     protocol,
  //     destChain,
  //     btcAddress,
  //     btcPubkey,
  //     feeRates,
  //   ],
  // );

  const handleSubmit = async (data: TransferFormData) => {
    if (!protocol || !sourceChain || !destChain) return;
    try {
      switch (true) {
        case isEvmChain(sourceChain) && isEvmChain(destChain):
          await sendEVMToEVM(data);
          break;
        case isBtcChain(sourceChain) && isEvmChain(destChain):
          // await sendBtcToEvm(data);
          break;
        // case isEvmChain(sourceChain) && isBtcChain(destChain):
        //   await sendEvmToBtc(data);
        //   break;
        default:
          throw new Error("Unsupported chain");
      }

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
                sourceChain={sourceChain}
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
