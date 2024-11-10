import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Psbt, Transaction, address as bitcoinAddress } from "bitcoinjs-lib";
import { ethers, parseUnits } from "ethers";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useAccount, useChainId, useConnect, useReadContract } from "wagmi";
import { z } from "zod";

import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useUnbondModal } from "@/app/stores/modal";
import { DApp } from "@/app/types/dApps";
import { ExtendedProjectENV, ProjectENV } from "@/env";
import { useEthersSigner } from "@/utils/ethers";

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

import { GeneralModal } from "./GeneralModal";

const SBTC_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "allowance",
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
];

const PROTOCOL_ABI = [
  {
    type: "function",
    name: "unstake",
    inputs: [
      {
        name: "_destinationChain",
        type: "string",
        internalType: "string",
      },
      {
        name: "_destinationAddress",
        type: "string",
        internalType: "string",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_psbtBase64",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const FormSchema = z.object({
  btcReceiverAddress: z
    .string({
      required_error: "Please enter your btc receiver address.",
    })
    .min(12, "Invalid BTC address"),
});

const MOCK_ZERO_BYTES = "0x0000000000000000000000000000000000000000";

export const UnbondModal: React.FC = () => {
  const { address } = useAccount();
  const { isOpen, close, bond } = useUnbondModal();
  const { address: btcAddress, pubkey } = useWalletInfo();
  const { btcNetwork, walletProvider } = useWalletProvider();

  const queryClient = useQueryClient();

  const data = queryClient.getQueryData<{ dApps: DApp[] }>(["getListDApps"]);
  const dApp = useMemo(() => {
    if (!data?.dApps) {
      return null;
    }
    return data.dApps.find(
      (dApp) =>
        dApp.scAddress.toLocaleLowerCase() ===
        bond?.destinationSmartContractAddress?.toLocaleLowerCase(),
    );
  }, [data, bond]);

  const signer = useEthersSigner();

  const sBTC = useMemo(() => {
    if (!bond) {
      return null;
    }
    return new ethers.Contract(
      bond?.destinationSmartContractAddress as `0x${string}`,
      SBTC_ABI,
      signer,
    );
  }, [bond, signer]);

  const protocol = useMemo(() => {
    if (!dApp) {
      return null;
    }
    return new ethers.Contract(
      dApp?.scAddress as `0x${string}`,
      PROTOCOL_ABI,
      signer,
    );
  }, [dApp, signer]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      btcReceiverAddress: btcAddress,
    },
  });

  const { data: sbtcBalance } = useReadContract({
    address: bond?.destinationSmartContractAddress as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!bond,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: bond?.destinationSmartContractAddress as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "allowance",
    args: [address, bond?.destinationSmartContractAddress as `0x${string}`],
    query: {
      enabled: !!bond,
    },
  });

  const [status, setStatus] = useState<string>("");
  const [isBurning, setIsBurning] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!bond) {
      throw new Error("Bond not found");
    }

    if (!dApp) {
      throw new Error("DApp not found");
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

    if (!sBTC) {
      throw new Error("sBTC contract not found");
    }

    if (!protocol) {
      throw new Error("Protocol contract not found");
    }

    if (!ExtendedProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS) {
      throw new Error("Covenant pubkeys not found");
    }

    const tokenBurnAmount = bond.amount;

    try {
      if (
        Number(sbtcBalance) <= 0 ||
        Number(sbtcBalance) < Number(tokenBurnAmount)
      ) {
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

      const input = {
        txid: txFromHex.getId(),
        vout: 0,
        value: BigInt(txFromHex.outs[0].value),
        script_pubkey: txFromHex.outs[0].script,
      };

      const output = {
        script: bitcoinAddress.toOutputScript(
          data.btcReceiverAddress,
          btcNetwork,
        ),
        value: input.value - BigInt(1_000),
      };

      const btcUserPk = scalarVaultModule.hexToBytes(pubkey.replace("0x", ""));

      const btcProtocolPk = scalarVaultModule.hexToBytes(
        dApp.btcPk.replace("0x", ""),
      );

      console.log("input", input);
      console.log("output", output);
      console.log("btcUserPk", btcUserPk);
      console.log("btcProtocolPk", btcProtocolPk);
      console.log(
        "ExtendedProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS",
        ExtendedProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS,
      );
      console.log(
        "ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM",
        ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM,
      );
      console.log(
        "ProjectENV.NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL",
        ProjectENV.NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL,
      );

      const unsignedPsbtHex =
        await globalThis.scalarVaultModule.buildUnsignedUnstakingUserProtocolPsbt(
          ProjectENV.NEXT_PUBLIC_TAG,
          ProjectENV.NEXT_PUBLIC_VERSION,
          input,
          output,
          btcUserPk,
          btcProtocolPk,
          ExtendedProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS,
          ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM,
          ProjectENV.NEXT_PUBLIC_HAVE_ONLY_CUSTODIAL,
        );

      setStatus("Signing the PSBT");

      const hexPsbt = scalarVaultModule.bytesToHex(unsignedPsbtHex);

      console.log("unsignedPsbtHex", hexPsbt);

      const psbtDetails = Psbt.fromHex(hexPsbt);

      console.log("psbtDetails", psbtDetails.txOutputs);

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
      if (Number(allowance) < Number(tokenBurnAmount)) {
        // Step 3: Call the contract to burn the token
        setStatus("Approving the token");
        setIsBurning(true);

        const txApprove = await sBTC.approve(dApp.scAddress, burnAmount);

        setStatus("Waiting for approval transaction to be mined");

        const response = await txApprove.wait();

        console.log("response", response);

        await refetchAllowance();
        setStatus("Approval transaction mined");
      }

      setStatus("Burning the token");

      console.log("signedPsbt", signedPsbt);

      const psbt = Psbt.fromHex(signedPsbt).toBase64();

      console.log("signedPsbt", signedPsbt);
      console.log("psbt", psbt);
      console.log("burnAmount", burnAmount);

      const txBurn = await protocol.unstake(
        bond.destinationChain,
        MOCK_ZERO_BYTES,
        burnAmount,
        psbt,
      );

      setStatus("Waiting for burning transaction to be mined");

      await txBurn.wait();

      setStatus("Token unstaked successfully");
    } catch (error: any) {
      console.error(error);
      setStatus(
        "Failed to burn the token: " + error?.message || JSON.stringify(error),
      );
      toast({
        title: "Failed to burn the token: ",
        description: error?.message || "An error occurred",
      });
    } finally {
      setIsBurning(false);
      const resetStatusTimeoutMs = 10000;
      setTimeout(() => {
        setStatus("");
      }, resetStatusTimeoutMs);
    }
  }

  if (!bond) {
    return <div>Bond not found</div>;
  }

  if (!dApp) {
    return <div>DApp not found</div>;
  }

  return (
    <GeneralModal open={isOpen} big onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Unstaked sBTC</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => close()}
        >
          <IoMdClose size={24} />
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
                  {bond.destinationChain.replace("ethereum-", " ")} Staker
                  Address
                </FormLabel>
                <Input readOnly value={address} />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-500">
                  BTC Staked Amount (sats)
                </FormLabel>
                <Input readOnly value={bond.amount} />
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



// 70736274ff01005202000000012b3a97ae1664d3ed739b7d7c6a2481987e111ba11a3a34901dcff8753f6f8ee90000000000fdffffff01b88201000000000016001450dceca158a9c872eb405d52293d351110572c9e000000000001012ba08601000000000022512067bff357780a93826a444646aec681c4ff1f4316244478c0d611f91a75c93b8a0103040000000041142ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a8b212098a1c9f95fadf69babfe738c34897215e91707f1fdba99fa5474d93b1f4036fb4588283184cb47eda759f42466e866c4fef6dbd05794ac5a10b1c6b2903d20f14d8fb0eb5e3ad0dd297579656b845896cdea4e4f01ee392254f2f6d557344215c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0063c58b39161dea318c02ae3381c4ddffa040ae88e6fe9ae1562c28f2db1028545202ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350aad201387aab21303782b17e760c670432559df3968e52cb82cc2d8f9be43a227d5dcacc021161387aab21303782b17e760c670432559df3968e52cb82cc2d8f9be43a227d5dc25018b212098a1c9f95fadf69babfe738c34897215e91707f1fdba99fa5474d93b1f0000000021162ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a25018b212098a1c9f95fadf69babfe738c34897215e91707f1fdba99fa5474d93b1f0000000001172050929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac00118204782e2e5ffe126f896b0fb1ee51ed2cd4ff0a7bafcbb8b335772a75b915a86900000