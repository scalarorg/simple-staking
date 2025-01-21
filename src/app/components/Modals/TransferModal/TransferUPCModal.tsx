"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import * as bitcoin from "bitcoinjs-lib";
import { isHexString } from "ethers";
import { WalletIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { decodeErrorResult } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { IGateway_ABI } from "@/abis/IGateway";
import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";
import { toast } from "@/app/components/ui/use-toast";
import { useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useERC20 } from "@/app/hooks/useERC20";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { useTransferModal } from "@/app/stores/modal";
import { getWagmiChain, isSupportedChain } from "@/app/wagmi";
import { getChainID } from "@/utils/scalar/chains";
import {
  decodeScalarBytesToString,
  decodeScalarBytesToUint8Array,
} from "@/utils/scalar/decode";

import { GeneralModal } from "../GeneralModal";

import { DestinationChainSection } from "./DestinationChainSection";
import { FormSchema, TransferFormData } from "./schema";
import { SourceChainSection } from "./SourceChainSection";
import { useGateway } from "./useGateway";
import { useGatewayContract } from "./useSendToken";
import { isBtcChain, isEvmChain, prepareCustodianPubkeys } from "./utils";

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

// First, let's create some helper functions at the top level
const validateTransferConfig = (
  sourceTokenAddress?: string,
  gateway?: { address?: string },
) => {
  if (
    !sourceTokenAddress ||
    !gateway?.address ||
    !isHexString(gateway.address)
  ) {
    throw new Error("Invalid configuration");
  }
};

const handleTokenApproval = async (
  sourceChainAddress: string,
  gatewayAddress: `0x${string}`,
  transferAmount: bigint,
  { checkAllowance, approveERC20 }: any,
) => {
  const currentAllowance = await checkAllowance(
    sourceChainAddress,
    gatewayAddress,
  );

  if (currentAllowance < transferAmount) {
    try {
      const approvalTx = await approveERC20(gatewayAddress, transferAmount);
      if (!approvalTx) throw new Error("Failed to create approval transaction");

      const approvalConfirmed = await Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Approval timeout")), 60000),
        ),
        approvalTx.wait(),
      ]);

      if (!approvalConfirmed) {
        throw new Error("Approval failed");
      }
    } catch (error: any) {
      if (error.message?.includes("contract runner")) {
        throw new Error(
          "Please ensure your wallet is connected and network is correct",
        );
      }
      throw error;
    }
  }
};

export const TransferUPCModal = () => {
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
  const {
    address: btcAddress,
    pubkey: btcPubkey,
    balance: btcBalance,
  } = useWalletInfo();
  const { networkConfig, btcNetwork, walletProvider, mempoolClient } =
    useWalletProvider();

  const vault = useVault(
    protocolTag ? decodeScalarBytesToString(protocolTag) : undefined,
  );
  const feeRates = useFeeRates(btcAddress, mempoolClient);

  const { address: evmAddress } = useAccount();
  const { switchChain } = useSwitchChain();
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

  const {
    approve: approveERC20,
    checkAllowance,
    approveError,
    balanceOf,
  } = useERC20(sourceTokenAddress as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: ["sourceChainBalance", protocol?.asset?.name, sourceChain?.chain],
    queryFn: async () => {
      if (!sourceChain) return BigInt(0);
      let balance = BigInt(0);
      if (isEvmChain(sourceChain)) {
        balance = await balanceOf(evmAddress as `0x${string}`);
      } else if (isBtcChain(sourceChain)) {
        balance = BigInt(btcBalance);
      }
      return balance;
    },
    enabled: !!sourceChain,
  });

  const { data: gateway } = useGateway(sourceChain?.chain);
  const lockingAddress = useMemo(() => {
    if (!vault) return null;
    if (!btcNetwork) return null;
    if (!sourceChain) return null;
    if (!isBtcChain(sourceChain)) return null;
    if (!protocol?.custodian_group?.custodians) return null;
    if (!protocol?.custodian_group?.quorum) return null;
    if (!protocol?.bitcoin_pubkey) return null;

    const custodianPubkeys = protocol?.custodian_group?.custodians.map(
      (custodian) => custodian.btc_pubkey,
    );
    if (!custodianPubkeys) return null;
    const custodianPubkeysBuffer = prepareCustodianPubkeys(
      protocol?.custodian_group?.custodians,
    );
    if (!custodianPubkeysBuffer) return null;

    const custodianPubkeysBufferArray = new Uint8Array(
      custodianPubkeysBuffer.reduce(
        (acc: number[], curr) => [...acc, ...Array.from(curr)],
        [],
      ),
    );

    const userPubkey = scalarVaultModule.hexToBytes(
      btcPubkey.replace("0x", ""),
    );

    const protocolPubkey = decodeScalarBytesToUint8Array(
      protocol.bitcoin_pubkey,
    );

    console.log("protocolPubkey", Buffer.from(protocolPubkey).toString("hex"));

    const script = vault.upcLockingScript({
      userPubkey,
      protocolPubkey,
      custodianPubkeys: custodianPubkeysBufferArray,
      custodianQuorum: protocol?.custodian_group?.quorum,
    });
    if (!script) return null;

    try {
      return bitcoin.address.fromOutputScript(script, btcNetwork);
    } catch (error) {
      console.error({ error });
      return null;
    }
  }, [sourceChain, btcNetwork, protocol, vault, btcPubkey]);

  const {
    sendToken,
    callContractWithToken,
    isPending,
    error: gatewayError,
  } = useGatewayContract(gateway?.address as `0x${string}`);

  const sendEVMToEVM = useCallback(
    async (data: TransferFormData) => {
      try {
        validateTransferConfig(sourceTokenAddress, gateway);

        if (
          !isEvmChain(data.destinationChain) ||
          !isEvmChain(data.sourceChain)
        ) {
          throw new Error("Invalid chain types");
        }

        if (!evmAddress) {
          throw new Error("Please connect your wallet first");
        }

        const balance = sourceChainBalance || 0n;
        if (balance < BigInt(data.transferAmount)) {
          throw new Error(
            `Insufficient balance, your balance is ${balance} ${protocol?.asset?.name}. Please try a smaller amount.`,
          );
        }

        await handleTokenApproval(
          data.sourceChainAddress,
          gateway?.address as `0x${string}`,
          BigInt(data.transferAmount),
          { checkAllowance, approveERC20 },
        );

        try {
          const transferTx = await sendToken({
            destinationChain: data.destinationChain,
            destinationAddress: data.destRecipientAddress,
            symbol: protocol?.asset?.name || "",
            amount: BigInt(data.transferAmount),
          });

          if (!transferTx)
            throw new Error("Failed to create transfer transaction");

          const transferConfirmed = await Promise.race([
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Transfer timeout")), 60000),
            ),
            transferTx.wait(),
          ]);

          if (transferConfirmed) {
            showSuccessTx(transferTx.hash, data.sourceChain);
          } else {
            throw new Error("Transfer failed");
          }
        } catch (error: any) {
          if (error.message?.includes("contract runner")) {
            throw new Error(
              "Please ensure your wallet is connected and network is correct",
            );
          }
          throw error;
        }
      } catch (error: any) {
        let errorMessage = "";

        if (error.data) {
          try {
            const decodedError = decodeErrorResult({
              abi: IGateway_ABI,
              data: error.data as `0x${string}`,
            });

            errorMessage = `Contract error: ${decodedError.errorName}`;
            if (decodedError.args) {
              errorMessage += ` (${decodedError.args.join(", ")})`;
            }
          } catch (decodeError) {
            console.error("Failed to decode error:", decodeError);
          }
        }

        if (!errorMessage) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    },
    [
      approveERC20,
      sendToken,
      sourceTokenAddress,
      gateway,
      protocol,
      showSuccessTx,
      checkAllowance,
      evmAddress,
      sourceChainBalance,
    ],
  );

  const sendEVMToBTC = useCallback(
    async (data: TransferFormData) => {
      try {
        validateTransferConfig(sourceTokenAddress, gateway);

        if (
          !isEvmChain(data.sourceChain) ||
          !isBtcChain(data.destinationChain)
        ) {
          throw new Error("Invalid chain types");
        }

        const balance = await balanceOf(data.sourceChainAddress);
        if (balance < BigInt(data.transferAmount)) {
          throw new Error("Insufficient balance");
        }

        await handleTokenApproval(
          data.sourceChainAddress,
          gateway?.address as `0x${string}`,
          BigInt(data.transferAmount),
          { checkAllowance, approveERC20 },
        );

        const lockingScript = bitcoin.address.toOutputScript(
          data.destRecipientAddress,
          btcNetwork,
        );

        const reciepientChainIdentifier =
          Buffer.from(lockingScript).toString("hex");

        const payload = scalarVaultModule.calculateContractCallWithTokenPayload(
          scalarVaultModule.BTCFeeOpts.MinimumFee,
          true,
          `0x${reciepientChainIdentifier}`,
        );

        const contractCallTx = await callContractWithToken({
          destinationChain: data.destinationChain,
          destinationContractAddress: EMPTY_ADDRESS,
          payload,
          symbol: protocol?.asset?.name || "",
          amount: BigInt(data.transferAmount),
        });

        const contractCallConfirmed = await Promise.race([
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Transfer timeout")), 60000),
          ),
          contractCallTx.wait(),
        ]);

        if (contractCallConfirmed) {
          showSuccessTx(contractCallTx.hash, data.sourceChain);
        } else {
          throw new Error("Transfer failed");
        }
      } catch (error) {
        console.error({ error });
        throw error; // Re-throw to handle in the parent
      }
    },
    [
      btcNetwork,
      approveERC20,
      sourceTokenAddress,
      gateway,
      protocol,
      showSuccessTx,
      balanceOf,
      callContractWithToken,
      checkAllowance,
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
      if (!protocol?.bitcoin_pubkey) throw new Error("Invalid protocol pubkey");
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
          data.btcFeeRate === "customFee"
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

      // prepare protocol pubkey
      const protocolPubkey = decodeScalarBytesToUint8Array(
        protocol.bitcoin_pubkey,
      );

      const chainID = getChainID(data.destinationChain);
      if (!chainID) throw new Error("Invalid destination chain");

      const destinationChain = new scalarVaultModule.DestinationChain(
        scalarVaultModule.ChainType.EVM,
        BigInt(chainID),
      );

      const { psbt: unsignedVaultPsbt } = vault.buildUPCStakingPsbt({
        stakingAmount: BigInt(data.transferAmount),
        stakerPubkey: txData.addresses.btcUserPk,
        stakerAddress: btcAddress,
        protocolPubkey,
        custodianPubkeys: custodianPubkeysBufferArray,
        custodianQuorum: protocol.custodian_group.quorum,
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

      const txHex = bitcoin.Psbt.fromHex(signedPsbt)
        .extractTransaction()
        .toHex();
      const txId = await walletProvider.pushTx(txHex);

      showSuccessTx(txId, data.sourceChain);
    },
    [
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

      // wait for 10 seconds before closing
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      // close();
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
    if (gatewayError) {
      toast({
        title: "Error",
        description:
          (gatewayError as any)?.shortMessage || "Failed to send token",
      });
      console.error({
        sendError: gatewayError,
      });
      return;
    }
    if (approveError) {
      console.error({ approveError });
      return;
    }
    if (approveError) {
      toast({
        title: "Error",
        description:
          (approveError as any)?.shortMessage || "Failed to approve ERC20",
      });
      console.error({ approveError });
      return;
    }
  }, [gatewayError, approveError]);

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
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="col-span-1 flex items-center gap-2">
                <WalletIcon size={16} />
                {sourceChain && (
                  <span className="text-sm font-bold text-orange-500">
                    {sourceChainBalance
                      ? (Number(sourceChainBalance) / 10 ** 8).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          },
                        )
                      : 0}{" "}
                    $
                    {(isBtcChain(sourceChain)
                      ? "BTC"
                      : protocol?.asset?.name
                    )?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="col-span-1"></div>
              <SourceChainSection
                form={form}
                protocol={protocol}
                selectedSourceChain={sourceChain}
                sourceTokenAddress={sourceTokenAddress}
                sourceChainAddress={watchSourceChainAddress}
                gateway={gateway?.address || ""}
                lockingAddress={lockingAddress || ""}
              />
              <DestinationChainSection
                form={form}
                protocol={protocol}
                selectedDestChain={destChain}
                onConnectWallet={onConnectWallet}
                watchTransferAmount={watchTransferAmount}
                sourceChain={sourceChain}
                evmAddress={evmAddress}
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
