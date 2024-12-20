import { zodResolver } from "@hookform/resolvers/zod";
import { Psbt, Transaction, address as bitcoinAddress } from "bitcoinjs-lib";
import { parseUnits } from "ethers";
import { Loader2, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { decodeErrorResult } from "viem";
import { useAccount, useChainId, useConnect } from "wagmi";
import { z } from "zod";

import PROTOCOL_ABI from "@/abis/protocol";
import SBTC_ABI from "@/abis/sbtc";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useScalarVaultModule, useVault } from "@/app/context/VaultContext";
import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import {
  useERC20Contract,
  useProtocolContract,
} from "@/app/hooks/useContracts";
import { useRecommendedFees } from "@/app/hooks/useRecommendedFees";
import { useUnbondModal } from "@/app/stores/modal";
import { hexStringWithout0x } from "@/utils/trim";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";

import { DestinationChain, Protocol } from "@/app/types/protocol";
import { GeneralModal } from "./GeneralModal";

const FormSchema = z.object({
  btcReceiverAddress: z
    .string({
      required_error: "Please enter your btc receiver address.",
    })
    .min(12, "Invalid BTC address"),
});

interface TxInput {
  script_pubkey: Buffer;
  txid: string;
  vout: number;
  value: bigint;
}

interface TxOutput {
  script: Buffer;
  value: bigint;
}

function calculateBitcoinTxFee(
  inputs: TxInput[],
  outputs: TxOutput[],
  feeRate: number,
): bigint {
  // Base transaction overhead
  let totalSize = 10.5; // Version (4) + LockTime (4) + Input/Output counters (2) + segwit marker and flag (0.5)

  // Calculate input sizes
  for (const input of inputs) {
    // Previous txid (32) + vout (4) + sequence (4) + empty scriptSig (1)
    let inputSize = 41;

    // Check if input is P2TR (Taproot)
    if (input.script_pubkey.length === 34 && input.script_pubkey[0] === 0x51) {
      // P2TR input witness: signature (64 bytes) + control block with key path spend (~33 bytes)
      inputSize += (64 + 33) / 4; // Witness data is divided by 4 for vsize calculation
    } else {
      // Assume P2WPKH
      // P2WPKH input witness: signature (72) + pubkey (33)
      inputSize += (72 + 33) / 4; // Witness data is divided by 4 for vsize calculation
    }

    totalSize += inputSize;
  }

  // Calculate output sizes
  for (const output of outputs) {
    // value (8) + script length (1) + script
    totalSize += 9 + output.script.length;
  }

  // Round up to the nearest byte
  const totalVBytes = Math.ceil(totalSize);

  // Calculate fee (sats) = vbytes * fee_rate
  return BigInt(Math.ceil(totalVBytes * feeRate));
}

const lookupErrorSignature = async (signature: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.openchain.xyz/signature-database/v1/lookup?filter=false&function=${signature}`,
    );
    const data = await response.json();

    if (data.ok && data.result.function[signature]?.[0]) {
      return data.result.function[signature][0].name;
    }
    return signature;
  } catch (error) {
    console.error("Failed to lookup error signature:", error);
    return signature;
  }
};

export const UnbondModal: React.FC = () => {
  const scalarVaultModule = useScalarVaultModule();
  const vault = useVault();

  const { address } = useAccount();
  const { isOpen, close, bond } = useUnbondModal();
  const { address: btcAddress, pubkey } = useWalletInfo();
  const { btcNetwork, walletProvider } = useWalletProvider();
  const { protocols } = useScalarClient();

  const { protocol, destinationChain } = useMemo<{
    protocol: Protocol | null;
    destinationChain: DestinationChain | null;
  }>(() => {
    if (!protocols.data?.protocols || !bond?.destinationSmartContractAddress) {
      return { protocol: null, destinationChain: null };
    }

    for (const p of protocols.data.protocols) {
      // Check each chain's smart contract address
      for (const chain of p.dest_chains) {
        if (
          hexStringWithout0x(
            scalarVaultModule.bytesToHex(chain.chain_smart_contract_address),
          ) ===
          hexStringWithout0x(bond.destinationSmartContractAddress.toLowerCase())
        ) {
          // Return both protocol and the matching chain
          return {
            protocol: p,
            destinationChain: chain,
          };
        }
      }
    }
    return { protocol: null, destinationChain: null };
  }, [protocols.data, bond?.destinationSmartContractAddress]);

  const { balance, allowance, approve } = useERC20Contract(
    SBTC_ABI,
    hexStringWithout0x(destinationChain?.token.token_address || ""),
    address,
    scalarVaultModule.bytesToHex(
      destinationChain?.chain_smart_contract_address || new Uint8Array(),
    ),
  );

  const { unstake } = useProtocolContract(
    PROTOCOL_ABI,
    scalarVaultModule.bytesToHex(
      destinationChain?.chain_smart_contract_address || new Uint8Array(),
    ),
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      btcReceiverAddress: btcAddress,
    },
  });

  const { fastest } = useRecommendedFees();

  useEffect(() => {
    if (!form.getValues("btcReceiverAddress")) {
      form.setValue("btcReceiverAddress", btcAddress);
    }
  }, [btcAddress, form]);

  const [status, setStatus] = useState<string>("");
  const [isBurning, setIsBurning] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!bond) {
      throw new Error("Bond not found");
    }

    if (!protocol) {
      throw new Error("Protocol not found");
    }

    if (!pubkey) {
      throw new Error("BTC pubkey not found");
    }

    if (!btcAddress) {
      throw new Error("BTC address not found");
    }

    if (!data.btcReceiverAddress) {
      throw new Error("BTC receiver address not found");
    }

    const tokenBurnAmount = bond.amount;

    try {
      if (Number(balance) <= 0 || Number(balance) < Number(tokenBurnAmount)) {
        throw new Error("Insufficient balance");
      }

      const burnAmount = parseUnits(tokenBurnAmount, 0);
      if (!burnAmount) {
        throw new Error("Invalid burn amount");
      }

      // TODO: get destination chain and address from the payload

      setStatus("Estimating the fee");
      setIsBurning(true);

      const txFromHex = Transaction.fromHex(bond.sourceTxHex);

      const input: TxInput = {
        txid: txFromHex.getId(),
        vout: 0,
        value: BigInt(txFromHex.outs[0].value),
        script_pubkey: txFromHex.outs[0].script,
      };

      const output: TxOutput = {
        script: bitcoinAddress.toOutputScript(
          data.btcReceiverAddress,
          btcNetwork,
        ),
        value: input.value,
      };

      const txFee = calculateBitcoinTxFee([input], [output], fastest * 1.5);

      output.value = output.value - BigInt(txFee);

      const btcUserPk = scalarVaultModule.hexToBytes(pubkey.replace("0x", ""));

      const btcProtocolPk = protocol.btc_chain.btc_signer_pk;

      const numberOfCustodianPubkeys =
        protocol.custodian_group.Custodians.length;
      const custodian_pubkeys_uint8array = new Uint8Array(
        33 * numberOfCustodianPubkeys,
      );

      for (let i = 0; i < numberOfCustodianPubkeys; i++) {
        custodian_pubkeys_uint8array.set(
          protocol.custodian_group.Custodians[i].BtcPublicKey,
          i * 33,
        );
      }

      const unsignedPsbtHex = vault.buildUnsignedUnstakingUserProtocolPsbt({
        input,
        output,
        stakerPubkey: btcUserPk,
        protocolPubkey: btcProtocolPk,
        covenantPubkeys: custodian_pubkeys_uint8array,
        covenantQuorum: protocol.custodian_group.Quorum,
        haveOnlyCovenants: false,
        feeRate: txFee,
        rbf: false,
      });

      setStatus("Signing the PSBT");

      const hexPsbt = scalarVaultModule.bytesToHex(unsignedPsbtHex);

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

      if (!signedPsbt) {
        throw new Error("Failed to sign the psbt");
      }

      // // Step 2.1: Check if the allowance is enough
      if (!allowance || Number(allowance) < Number(tokenBurnAmount)) {
        // Step 3: Call the contract to burn the token
        setStatus("Approving the token");
        setIsBurning(true);

        await approve(
          scalarVaultModule.bytesToHex(
            destinationChain?.chain_smart_contract_address || new Uint8Array(),
          ),
          burnAmount,
        );

        setStatus("Approval transaction mined");
      }

      setStatus("Burning the token");

      const psbt = Psbt.fromHex(signedPsbt).toBase64();

      setStatus("Unstaking the token");

      // TODO: Remove prefix when server is updated
      const psbt_base64_with_prefix = `80${psbt}`;
      await unstake(bond.sourceChain, burnAmount, psbt_base64_with_prefix);

      setStatus("Token unstaked successfully");
      close();
    } catch (error: any) {
      console.log({ error });
      let errorMessage = "An error occurred";

      if (error?.data) {
        // Handle Viem-style errors
        try {
          const decodedError = decodeErrorResult({
            abi: PROTOCOL_ABI,
            data: error.data as `0x${string}`,
          });
          errorMessage = `${decodedError.errorName}: ${decodedError.args?.join(", ")}`;
        } catch (decodeError) {
          // Try to decode as an approval error
          setStatus("Decoding error...");
          const errorSignature = error.data.slice(0, 10);
          errorMessage = await lookupErrorSignature(errorSignature);
        }
      } else {
        errorMessage = error.shortMessage || error.message;
      }

      setStatus(`Failed: ${errorMessage}`);
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsBurning(false);
    } finally {
      setIsBurning(false);
      const resetStatusTimeoutMs = 10000;
      setTimeout(() => {
        setStatus("");
      }, resetStatusTimeoutMs);
    }
  }

  if (!bond && isOpen) {
    return <div>Bond not found</div>;
  }

  if (!protocol && isOpen) {
    return <div>Protocol not found</div>;
  }

  return (
    <GeneralModal open={isOpen} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Unstaked sBTC</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <XIcon size={24} />
        </button>
      </div>
      {address ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <FormLabel className="text-gray-500">
                  Bitcoin Staker Address
                </FormLabel>
                <Input readOnly value={btcAddress} />
              </div>
              <div className="space-y-2 col-span-2">
                <FormLabel className="text-gray-500 capitalize">
                  {bond?.destinationChain.replace("ethereum-", " ")} Staker
                  Address
                </FormLabel>
                <Input readOnly value={address} />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-500">
                  BTC Staked Amount (sats)
                </FormLabel>
                <Input readOnly value={bond?.amount ?? ""} />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-500">Unstaked Amount</FormLabel>
                <Input readOnly value={bond?.amount ?? ""} />
              </div>
            </div>

            <FormField
              control={form.control}
              name="btcReceiverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BTC Receiver Address</FormLabel>
                  <FormDescription>
                    The address to receive the staked btc.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-4">
              {isBurning && <Loader2 size={32} className="animate-spin" />}
              {status && <div className="max-w-md break-words">{status}</div>}
            </div>

            {!isBurning && (
              <div className="flex justify-end">
                <Button className="" variant="outline" type="submit">
                  Unstake
                </Button>
              </div>
            )}
          </form>
        </Form>
      ) : (
        <ConnectWallet />
      )}
    </GeneralModal>
  );
};

const ConnectWallet: React.FC = () => {
  const chainId = useChainId();
  const { connectors, connect, status, error } = useConnect();

  return (
    <div className="flex flex-col gap-4 items-center">
      <h2>Choose Ethereum Wallet</h2>
      <div className="flex gap-2 flex-col w-full">
        {connectors.map((connector) => (
          <button
            className="btn btn-gray-700 hover:bg-gray-500 transition-colors"
            key={connector.uid}
            onClick={() => connect({ connector, chainId })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
      </div>
      {status === "pending" && <Loader2 size={32} className="animate-spin" />}
      {error?.message && <div>Error: {error.message}</div>}
    </div>
  );
};
