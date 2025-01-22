import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import { useQuery } from "@tanstack/react-query";
import * as bitcoin from "bitcoinjs-lib";
import { useCallback, useMemo, useState } from "react";
import { decodeErrorResult } from "viem";

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

export const UPCTransferModal = ({ protocol }: { protocol: TProtocol }) => {
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
    mempoolClient,
    onConnectWallet,
    showSuccessTx,
    checkAllowance,
    approveERC20,
    balanceOf,
    sendToken,
    callContractWithToken,
  } = useTransferLogic(protocol, FormSchema);

  const lockingScript = useMemo(() => {
    if (
      !vault ||
      !btcNetwork ||
      !sourceChain ||
      (!isBtcChain(sourceChain) && !isBtcChain(destChain)) ||
      !protocol.custodian_group?.custodians ||
      !protocol.custodian_group?.quorum ||
      !protocol.bitcoin_pubkey
    ) {
      return null;
    }

    const custodianPubkeysBufferArray = prepareCustodianPubkeysArray(
      protocol.custodian_group.custodians,
    );

    const userPubkey = scalarVaultModule.hexToBytes(
      btcPubkey.replace("0x", ""),
    );
    const protocolPubkey = decodeScalarBytesToUint8Array(
      protocol.bitcoin_pubkey,
    );

    const script = vault.upcLockingScript({
      userPubkey,
      protocolPubkey,
      custodianPubkeys: custodianPubkeysBufferArray,
      custodianQuorum: protocol.custodian_group.quorum,
    });

    return script;
  }, [sourceChain, destChain, btcNetwork, protocol, vault, btcPubkey]);

  const lockingAddress = useMemo(() => {
    if (!lockingScript) return null;
    return bitcoin.address.fromOutputScript(lockingScript, btcNetwork);
  }, [lockingScript, btcNetwork]);

  // TODO: use api to aggerate the utxos from scalar-core also
  const { data: availableUnstakedUtxos } = useQuery({
    queryKey: ["availableUnstakedUtxos", lockingAddress, destChain],
    queryFn: async () => {
      if (!isBtcChain(destChain)) return [];
      const addressUtxos = await mempoolClient!.addresses.getAddressTxsUtxo({
        address: lockingAddress!,
      });
      if (!addressUtxos) return [];
      return addressUtxos
        .filter((utxo) => utxo.status.confirmed)
        .sort((a, b) => {
          return b.value - a.value || b.txid.localeCompare(a.txid);
        });
    },
    enabled: !!lockingAddress && !!mempoolClient,
  });

  const [selectedUtxo, setSelectedUtxo] = useState<AddressTxsUtxo | null>(null);

  const onSelectUtxo = useCallback(
    (utxo: AddressTxsUtxo) => {
      if (!isBtcChain(destChain)) return;
      // TODO: enable this
      // if (!sourceChainBalance || utxo.value < sourceChainBalance) {
      //   form.setError("sourceChain", {
      //     message: "Insufficient balance",
      //   });
      //   return;
      // }

      form.clearErrors("sourceChain");

      setSelectedUtxo(utxo);
      form.setValue("transferAmount", utxo.value.toString());
    },
    [destChain, form],
  );

  const sendEVMToBTC = useCallback(
    async (data: TransferFormData) => {
      try {
        validateRequiredFields({
          vault,
          utxo: selectedUtxo,
          userPubkey: btcPubkey,
          lockingScript,
          btcNetwork,
          protocolPubkey: protocol?.bitcoin_pubkey,
          protocol,
          walletProvider,
          destChain,
          custodians: protocol?.custodian_group?.custodians,
          quorum: protocol?.custodian_group?.quorum,
          btcPubkey,
          btcAddress,
        });

        if (
          !isEvmChain(data.sourceChain) ||
          !isBtcChain(data.destinationChain)
        ) {
          throw new Error("Invalid chain types");
        }

        const utxo = selectedUtxo!;

        const userLockingScript = bitcoin.address.toOutputScript(
          btcAddress,
          btcNetwork,
        );

        const unsignedPsbtHex = vault!.buildUPCUnstakingPsbt({
          input: {
            txid: utxo.txid,
            vout: utxo.vout,
            value: BigInt(Math.floor(utxo.value)),
            script_pubkey: lockingScript!,
          },
          output: {
            script: userLockingScript,
            value: BigInt(Math.floor(utxo.value)),
          },
          stakerPubkey: scalarVaultModule.hexToBytes(
            btcPubkey.replace("0x", ""),
          ),
          protocolPubkey: decodeScalarBytesToUint8Array(
            protocol.bitcoin_pubkey!,
          ),
          custodianPubkeys: prepareCustodianPubkeysArray(
            protocol?.custodian_group?.custodians || [],
          ),
          custodianQuorum: protocol?.custodian_group?.quorum!,
          feeRate: BigInt(1),
          rbf: true,
          type: "user_protocol",
        });

        const hexPsbt = scalarVaultModule.bytesToHex(unsignedPsbtHex);

        console.log({ hexPsbt });

        const signedPsbt = await walletProvider?.signPsbt(hexPsbt, {
          autoFinalized: false,
          toSignInputs: [
            {
              index: 0,
              address: btcAddress,
              disableTweakSigner: true,
            },
          ],
        });

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

        const payload = scalarVaultModule.calculateContractCallWithTokenPayload(
          {
            type: "upc",
            upc: {
              psbt: `0x${signedPsbt}`,
            },
          },
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
      btcNetwork,
      destChain,
      vault,
      walletProvider,
      selectedUtxo,
      btcPubkey,
      btcAddress,
      lockingScript,
      protocol,
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
        if (
          !isBtcChain(data.sourceChain) ||
          !isEvmChain(data.destinationChain)
        ) {
          throw new Error("Invalid chain types");
        }

        validateRequiredFields({
          vault,
          btcNetwork,
          protocol,
          walletProvider,
          destChain: destChain?.address,
          custodians: protocol?.custodian_group?.custodians,
          quorum: protocol?.custodian_group?.quorum,
          protocolPubkey: protocol?.bitcoin_pubkey,
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

        if (!protocol.bitcoin_pubkey) return null;

        const protocolPubkey = decodeScalarBytesToUint8Array(
          protocol.bitcoin_pubkey!,
        );

        const { psbt: unsignedVaultPsbt } = vault!.buildUPCStakingPsbt({
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
      availableUnstakedUtxos={availableUnstakedUtxos}
      onSelectUtxo={onSelectUtxo}
    />
  );
};
