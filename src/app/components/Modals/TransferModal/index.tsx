import { zodResolver } from "@hookform/resolvers/zod";
import { Psbt } from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { isHexString } from "ethers";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useTransferModal } from "@/app/stores/modal";
import { getWagmiChain, isSupportedChain } from "@/app/wagmi";
import { getChainID } from "@/utils/scalar/chains";
import { decodeScalarBytesToString } from "@/utils/scalar/decode";

import { GeneralModal } from "../GeneralModal";

import { DestinationChainSection } from "./DestinationChainSection";
import { FormSchema, TransferFormData } from "./schema";
import { SourceChainSection } from "./SourceChainSection";
import { useCallContractWithToken } from "./useContractCallWithToken";
import { useGateway } from "./useGateway";
import { useSendToken } from "./useSendToken";
import { isBtcChain, isEvmChain, prepareCustodianPubkeys } from "./utils";

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  const protocolTag = protocol?.tag;
  const { address: btcAddress, pubkey: btcPubkey } = useWalletInfo();
  const { networkConfig, btcNetwork, walletProvider, mempoolClient } =
    useWalletProvider();

  const vault = useVault(
    protocolTag ? decodeScalarBytesToString(protocolTag) : undefined,
  );
  const feeRates = useFeeRates(btcAddress, mempoolClient);

  const { address: evmAddress } = useAccount();
  const { switchChain, error } = useSwitchChain();
  const chainId = useChainId();

  const [destChain, setDestChain] = useState<TProtocolChain>();
  const [sourceChain, setSourceChain] = useState<TProtocolChain>();

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");
  const watchSourceChainAddress = form.watch("sourceChainAddress");

  const sourceTokenAddress = sourceChain?.address;

  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      return;
    }
    const chain = protocol.chains?.find((c) => c.chain === watchSourceChain);
    if (!chain) return;
    setSourceChain(chain);
    if (form.getValues("destinationChain") === chain.chain) {
      const otherChains = protocol.chains?.filter(
        (c) => c.chain !== chain.chain,
      );
      if (otherChains && otherChains?.length > 0) {
        setDestChain(otherChains[0]);
        form.setValue("destinationChain", otherChains[0]?.chain || "");
      }
    }
  }, [watchSourceChain, protocol, form, setDestChain]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      return;
    }
    const chain = protocol.chains?.find(
      (c) => c.chain === watchDestinationChain,
    );
    if (!chain) return;
    setDestChain(chain);
    if (isBtcChain(chain)) {
      form.setValue("destRecipientAddress", btcAddress || "");
    } else if (isEvmChain(chain)) {
      form.setValue("destRecipientAddress", evmAddress || "");
    }
  }, [watchDestinationChain, protocol, form, btcAddress, evmAddress]);

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
      form.setValue("destRecipientAddress", btcAddress || "");
    }
  }, [evmAddress, btcAddress, form, destChain]);

  const showSuccessTx = useCallback(
    (txid: string, chain: string) => {
      let link = "";
      if (isBtcChain(chain)) {
        link = `${networkConfig?.mempoolApiUrl}/tx/${txid}`;
      } else if (isEvmChain(chain)) {
        const chainId = getChainID(chain);
        if (!isSupportedChain(Number(chainId))) return;
        const wagmiChain = getWagmiChain(Number(chainId));
        if (!wagmiChain) return;
        link = `${wagmiChain.blockExplorers?.default.url}/tx/${txid}`;
      }
      toast({
        title: "Transfer transaction successful",
        description: (
          <div className="mt-2 w-[640px] rounded-md bg-slate-950">
            <p className="text-white">
              Txid:{" "}
              <Link
                className="text-blue-500 underline"
                href={link}
                target="_blank"
              >
                {txid.slice(0, 8)}...{txid.slice(-8)} (click to view)
              </Link>
            </p>
          </div>
        ),
      });
    },
    [networkConfig?.mempoolApiUrl],
  );

  const { data: gateway } = useGateway(sourceChain?.chain);

  const {
    sendToken,
    isConfirmed: isConfirmedSendToken,
    isPending: isPendingSendToken,
    hash: hashSendToken,
    error: sendError,
    receiptError: sendTokenReceiptError,
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

      while (!isPendingSendToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      showSuccessTx((hashSendToken || "") as string, data.sourceChain);
    },
    [
      sendToken,
      sourceTokenAddress,
      gateway,
      protocol,
      isPendingSendToken,
      hashSendToken,
      showSuccessTx,
    ],
  );

  const {
    callContractWithToken,
    isConfirmed: isConfirmedCallContractWithToken,
    isPending: isPendingCallContractWithToken,
    hash: hashCallContractWithToken,
    error: callContractWithTokenError,
    receiptError: callContractWithTokenReceiptError,
  } = useCallContractWithToken();

  const sendEVMToBTC = useCallback(
    async (data: TransferFormData) => {
      if (!sourceTokenAddress) return;
      if (!gateway || !gateway.address) return;
      if (!isHexString(gateway.address)) return;
      if (!isEvmChain(data.sourceChain)) return;
      if (!isBtcChain(data.destinationChain)) return;

      console.log({ recipient: data.destRecipientAddress });

      const lockingScript = toOutputScript(
        data.destRecipientAddress,
        btcNetwork,
      );

      console.log({ lockingScript: lockingScript.toString("hex") });

      const payload = scalarVaultModule.calculateContractCallWithTokenPayload(
        scalarVaultModule.BTCFeeOpts.MinimumFee,
        true,
        `0x${lockingScript.toString("hex")}`,
      );

      console.log({ payload });

      callContractWithToken({
        destinationChain: data.destinationChain,
        destinationContractAddress: EMPTY_ADDRESS,
        payload: payload,
        symbol: protocol?.asset?.name || "",
        amount: BigInt(data.transferAmount),
        gatewayAddress: gateway.address as THexString,
      });

      while (!isPendingCallContractWithToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      showSuccessTx(
        (hashCallContractWithToken || "") as string,
        data.sourceChain,
      );
    },
    [
      btcNetwork,
      sourceTokenAddress,
      gateway,
      protocol,
      isPendingCallContractWithToken,
      hashCallContractWithToken,
      showSuccessTx,
      callContractWithToken,
    ],
  );

  const sendBTCToEvm = useCallback(
    async (data: TransferFormData) => {
      if (!vault) throw new Error("Vault not found");
      if (!isBtcChain(data.sourceChain))
        throw new Error("Invalid source chain");
      if (!isEvmChain(data.destinationChain))
        throw new Error("Invalid destination chain");
      if (!btcNetwork) throw new Error("Invalid BTC network");
      if (!protocol) throw new Error("Invalid protocol");
      if (!walletProvider) throw new Error("Invalid wallet provider");
      if (!destChain) throw new Error("Invalid destination chain");
      if (!destChain?.address)
        throw new Error("Invalid destination chain address");
      if (!protocol?.custodian_group?.custodians)
        throw new Error("Invalid custodian pubkeys");
      if (!protocol?.custodian_group?.quorum)
        throw new Error("Invalid custodian quorum");
      if (!btcPubkey) throw new Error("Invalid BTC pubkey");
      if (!btcAddress) throw new Error("Invalid BTC address");

      const requiredFields = {
        btcNetwork,
        protocol,
        walletProvider,
        destChain: destChain?.address,
        custodians: protocol?.custodian_group?.custodians,
        quorum: protocol?.custodian_group?.quorum,
        destinationChain: data.destinationChain,
      };

      // Validate all required fields exist
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) throw new Error(`Missing required field: ${key}`);
      }

      // // Get and validate UTXOs
      const addressUtxos = await walletProvider.getUtxos(
        btcAddress,
        Number(data.transferAmount),
      );
      if (!addressUtxos) throw new Error("Not enough UTXOs");

      // // Prepare transaction data
      const txData = {
        utxos: addressUtxos.map((utxo) => ({ ...utxo, status: {} as any })),
        feeRate:
          data.btcFeeRate === "custom"
            ? (data.customFeeRate ?? feeRates.fastestFee)
            : feeRates.minimumFee,
        addresses: {
          btcUserPk: scalarVaultModule.hexToBytes(btcPubkey.replace("0x", "")),
          destinationRecipient: scalarVaultModule.hexToBytes(
            data.destRecipientAddress.replace("0x", ""),
          ),
          destinationToken: scalarVaultModule.hexToBytes(
            destChain.address.replace("0x", ""),
          ),
        },
      };

      // // Prepare custodian pubkeys
      const custodianPubkeysBuffer = prepareCustodianPubkeys(
        protocol.custodian_group.custodians,
      );

      if (!custodianPubkeysBuffer) throw new Error("Invalid custodian pubkeys");

      const custodianPubkeysBufferArray = new Uint8Array(
        custodianPubkeysBuffer.reduce(
          (acc: number[], curr) => [...acc, ...Array.from(curr)],
          [],
        ),
      );

      console.log({ custodianPubkeysBuffer });

      const destinationChain = new scalarVaultModule.DestinationChain(
        scalarVaultModule.ChainType.EVM,
        BigInt(chainId),
      );

      const { psbt: unsignedVaultPsbt } =
        vault.buildStakingOutputWithOnlyCovenants({
          stakingAmount: BigInt(data.transferAmount),
          stakerPubkey: txData.addresses.btcUserPk,
          stakerAddress: btcAddress,
          custodialPubkeys: custodianPubkeysBufferArray,
          covenantQuorum: protocol.custodian_group.quorum,
          destinationChain,
          destinationContractAddress: txData.addresses.destinationToken,
          destinationRecipientAddress: txData.addresses.destinationRecipient,
          availableUTXOs: txData.utxos,
          feeRate: txData.feeRate,
          rbf: true,
        });

      // // Sign and broadcast transaction
      const signedPsbt = await walletProvider.signPsbt(
        unsignedVaultPsbt.toHex(),
        {
          autoFinalized: true,
        },
      );
      if (!signedPsbt) throw new Error("Failed to sign the PSBT");

      const txHex = Psbt.fromHex(signedPsbt).extractTransaction().toHex();
      const txId = await walletProvider.pushTx(txHex);

      showSuccessTx(txId, data.sourceChain);
    },
    [
      chainId,
      vault,
      walletProvider,
      btcNetwork,
      protocol,
      destChain,
      btcAddress,
      btcPubkey,
      feeRates,
      showSuccessTx,
    ],
  );

  const handleSubmit = async (data: TransferFormData) => {
    if (!protocol || !sourceChain || !destChain) return;
    try {
      switch (true) {
        case isEvmChain(sourceChain) && isEvmChain(destChain):
          await sendEVMToEVM(data);
          break;
        case isBtcChain(sourceChain) && isEvmChain(destChain):
          await sendBTCToEvm(data);
          break;
        case isEvmChain(sourceChain) && isBtcChain(destChain):
          await sendEVMToBTC(data);
          break;
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
    if (sendTokenReceiptError || callContractWithTokenReceiptError) {
      toast({
        title: "Error",
        description:
          sendTokenReceiptError?.message ||
          callContractWithTokenReceiptError?.message,
      });
    }
    if (sendError || callContractWithTokenError) {
      toast({
        title: "Error",
        description: sendError?.message || callContractWithTokenError?.message,
      });
      return;
    }
  }, [
    sendTokenReceiptError,
    sendError,
    callContractWithTokenReceiptError,
    callContractWithTokenError,
  ]);

  useEffect(() => {
    if (isConfirmedSendToken || isConfirmedCallContractWithToken) {
      toast({
        title: "Transaction confirmed",
        description: "Transaction has been confirmed",
      });
      close();
    }
  }, [
    isPendingSendToken,
    isPendingCallContractWithToken,
    isConfirmedSendToken,
    isConfirmedCallContractWithToken,
    close,
  ]);

  return (
    <GeneralModal open={true} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">
          Transfer token{""}
          <span className="ml-2 text-orange-500 font-bold text-xl">
            ${protocol?.asset?.name}
          </span>
        </h3>
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
              <Button
                variant="outline"
                type="submit"
                disabled={isPendingSendToken || isPendingCallContractWithToken}
              >
                {isPendingSendToken || isPendingCallContractWithToken
                  ? "Sending..."
                  : "Transfer"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </GeneralModal>
  );
};
