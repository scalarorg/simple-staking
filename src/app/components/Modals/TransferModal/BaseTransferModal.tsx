import * as bitcoin from "bitcoinjs-lib";
import { XIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

import { decodeErrorResult } from "viem";
import { GeneralModal } from "../GeneralModal";

import { IGateway_ABI } from "@/abis/IGateway";
import { decodeScalarBytesToUint8Array } from "@/utils/scalar/decode";
import { toast } from "../../ui/use-toast";
import { TransferForm } from "./components/TransferForm";
import { FormSchema, TransferFormData } from "./components/schema";
import { useTransferLogic } from "./hooks/useTransferLogic";
import {
  EMPTY_ADDRESS,
  getChainID,
  handleError,
  handleTokenApproval,
  isBtcChain,
  isEvmChain,
  prepareCustodianPubkeysArray,
  validateRequiredFields,
  validateTransferConfig,
} from "./utils";

export const BaseTransferModal = ({
  protocol,
  close,
}: {
  protocol: TProtocol;
  close: () => void;
}) => {
  if (!protocol || !protocol.attribute) {
    throw new Error("Protocol or protocol attribute is undefined");
  }

  const type = protocol.attribute.model;

  const {
    form,
    vault,
    walletProvider,
    btcNetwork,
    btcAddress,
    btcPubkey,
    feeRates,
    evmAddress,
    gateway,
    sourceChainBalance,
    sourceChain,
    destChain,
    sourceTokenAddress,
    watchTransferAmount,
    watchSourceChainAddress,
    isInteractingWithGateway,
    onConnectWallet,
    showSuccessTx,
    checkAllowance,
    approveERC20,
    balanceOf,
    sendToken,
    callContractWithToken,
  } = useTransferLogic(protocol, FormSchema);

  const lockingAddress = useMemo(() => {
    if (
      !vault ||
      !btcNetwork ||
      !sourceChain ||
      !isBtcChain(sourceChain) ||
      !protocol.custodian_group?.custodians ||
      !protocol.custodian_group?.quorum
    ) {
      return null;
    }

    const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
      protocol.custodian_group.custodians,
    );

    let script: Uint8Array | null = null;
    if (type === "LIQUIDITY_MODEL_POOLING") {
      script = vault.custodianOnlyLockingScript({
        custodianPubkeys: custodianPubkeysBufferArray,
        custodianQuorum: protocol.custodian_group.quorum,
      });
    } else if (type === "LIQUIDITY_MODEL_TRANSACTIONAL") {
      if (!protocol.bitcoin_pubkey) return null;

      const userPubkey = scalarVaultModule.hexToBytes(
        btcPubkey.replace("0x", ""),
      );
      const protocolPubkey = decodeScalarBytesToUint8Array(
        protocol.bitcoin_pubkey,
      );

      script = vault.upcLockingScript({
        userPubkey,
        protocolPubkey,
        custodianPubkeys: custodianPubkeysBufferArray,
        custodianQuorum: protocol.custodian_group.quorum,
      });
    }
    if (!script) return null;

    try {
      return bitcoin.address.fromOutputScript(script, btcNetwork);
    } catch (error) {
      console.error({ error });
      return null;
    }
  }, [sourceChain, btcNetwork, protocol, vault, btcPubkey, type]);

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
        handleError(error);
      }
    },
    [
      protocol,
      btcNetwork,
      sourceTokenAddress,
      gateway,
      approveERC20,
      showSuccessTx,
      balanceOf,
      callContractWithToken,
      checkAllowance,
    ],
  );

  const sendBTCToEvm = useCallback(
    async (data: TransferFormData) => {
      try {
        validateRequiredFields({
          vault,
          btcNetwork,
          protocol,
          walletProvider,
          destChain: destChain?.address,
          custodians: protocol?.custodian_group?.custodians,
          quorum: protocol?.custodian_group?.quorum,
          btcPubkey,
          btcAddress,
        });

        if (protocol?.custodian_group?.quorum! < 1) {
          throw new Error("Quorum must be greater than 0");
        }

        const addressUtxos = await walletProvider?.getUtxos(
          btcAddress,
          Number(data.transferAmount),
        );
        if (!addressUtxos) throw new Error("Not enough UTXOs");

        const txData = {
          utxos: addressUtxos.map((utxo) => ({ ...utxo, status: {} as any })),
          feeRate:
            data.btcFeeRate === "customFee"
              ? (data.customFeeRate ?? feeRates.fastestFee)
              : feeRates.minimumFee,
          addresses: {
            btcUserPk: scalarVaultModule.hexToBytes(
              btcPubkey.replace("0x", ""),
            ),
            destinationRecipient: scalarVaultModule.hexToBytes(
              data.destRecipientAddress.replace("0x", ""),
            ),
            destinationToken: scalarVaultModule.hexToBytes(
              destChain?.address?.replace("0x", "") || "",
            ),
          },
        };

        const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
          protocol?.custodian_group?.custodians || [],
        );

        const chainID = getChainID(data.destinationChain);
        if (!chainID) throw new Error("Invalid destination chain");

        const destinationChain = new scalarVaultModule.DestinationChain(
          scalarVaultModule.ChainType.EVM,
          BigInt(chainID),
        );

        let unsignedVaultPsbt: bitcoin.Psbt | null = null;

        if (type === "LIQUIDITY_MODEL_POOLING") {
          const { psbt } = vault!.buildCustodianOnlyStakingPsbt({
            stakingAmount: BigInt(data.transferAmount),
            stakerPubkey: txData.addresses.btcUserPk,
            stakerAddress: btcAddress,
            custodianPubkeys: custodianPubkeysBufferArray,
            custodianQuorum: protocol?.custodian_group?.quorum || 0,
            destinationChain,
            destinationContractAddress: txData.addresses.destinationToken,
            destinationRecipientAddress: txData.addresses.destinationRecipient,
            availableUTXOs: txData.utxos,
            feeRate: txData.feeRate,
            rbf: true,
          });
          unsignedVaultPsbt = psbt;
        } else if (type === "LIQUIDITY_MODEL_TRANSACTIONAL") {
          if (!protocol.bitcoin_pubkey) return null;

          const protocolPubkey = decodeScalarBytesToUint8Array(
            protocol.bitcoin_pubkey!,
          );

          const { psbt } = vault!.buildUPCStakingPsbt({
            stakingAmount: BigInt(data.transferAmount),
            stakerPubkey: txData.addresses.btcUserPk,
            stakerAddress: btcAddress,
            protocolPubkey,
            custodianPubkeys: custodianPubkeysBufferArray,
            custodianQuorum: protocol?.custodian_group?.quorum!,
            destinationChain,
            destinationContractAddress: txData.addresses.destinationToken,
            destinationRecipientAddress: txData.addresses.destinationRecipient,
            availableUTXOs: txData.utxos,
            feeRate: txData.feeRate,
            rbf: true,
          });
          unsignedVaultPsbt = psbt;
        }

        if (!unsignedVaultPsbt) throw new Error("Failed to build PSBT");

        const signedPsbt = await walletProvider?.signPsbt(
          unsignedVaultPsbt.toHex(),
          {
            autoFinalized: true,
          },
        );
        if (!signedPsbt) throw new Error("Failed to sign the PSBT");

        const txHex = bitcoin.Psbt.fromHex(signedPsbt)
          .extractTransaction()
          .toHex();
        const txId = await walletProvider?.pushTx(txHex);

        showSuccessTx(txId!, data.sourceChain);
      } catch (error) {
        handleError(error);
      }
    },
    [
      vault,
      type,
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
        <h3 className="font-bold">
          Transfer token{""}
          <span className="ml-2 text-orange-500 font-bold text-xl">
            ${protocol.asset?.name}
          </span>
        </h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <XIcon size={24} />
        </button>
      </div>

      <TransferForm
        form={form}
        handleSubmit={handleSubmit}
        sourceChain={sourceChain}
        destChain={destChain}
        sourceTokenAddress={sourceTokenAddress}
        watchSourceChainAddress={watchSourceChainAddress}
        watchTransferAmount={watchTransferAmount}
        onConnectWallet={onConnectWallet}
        sourceChainBalance={sourceChainBalance?.toString()}
        protocol={protocol}
        gatewayAddress={gateway?.address}
        lockingAddress={lockingAddress || undefined}
        isPending={isInteractingWithGateway}
        evmAddress={evmAddress}
      />
    </GeneralModal>
  );
};
