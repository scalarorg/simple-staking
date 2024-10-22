import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { getPsbtByHex } from "vault/index";
import { parseUnits } from "viem";
import { useAccount, useChainId, useConnect, useReadContract } from "wagmi";
import { z } from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { ProjectENV } from "@/env";
import { getBondValueStringFromStakingTxHex } from "@/utils/bitcoin";
import { useEthersSigner } from "@/utils/ethers";
import { UnisatOptions } from "@/utils/wallet/wallet_provider";

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

interface BurnTokenModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  btcAddress: string;
  signPsbt: (psbt: string, options?: UnisatOptions) => Promise<string>;
  stakingTxHex: string;
  tokenBurnAmount: string;
  protocolContractAddress: string;
}

const FormSchema = z.object({
  btcReceiverAddress: z
    .string({
      required_error: "Please enter your btc receiver address.",
    })
    .min(12, "Invalid BTC address"),
});

export const BurnTokenModal: React.FC<BurnTokenModalProps> = ({
  open,
  btcAddress,
  stakingTxHex,
  tokenBurnAmount,
  protocolContractAddress,
  onClose,
  signPsbt,
}) => {
  const { address } = useAccount();

  const signer = useEthersSigner();

  const sBTC = new ethers.Contract(
    ProjectENV.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS,
    SBTC_ABI,
    signer,
  );

  const protocol = new ethers.Contract(
    protocolContractAddress,
    PROTOCOL_ABI,
    signer,
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      btcReceiverAddress: btcAddress,
    },
  });

  const { data: sbtcBalance } = useReadContract({
    address: ProjectENV.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ProjectENV.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS as `0x${string}`,
    abi: SBTC_ABI,
    functionName: "allowance",
    args: [address, protocolContractAddress as `0x${string}`],
  });

  const [status, setStatus] = useState<string>("");
  const [isBurning, setIsBurning] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      if (
        Number(sbtcBalance) <= 0 ||
        Number(sbtcBalance) < Number(tokenBurnAmount)
      ) {
        throw new Error("Insufficient balance");
      }

      const burnAmount = parseUnits(tokenBurnAmount, 18);
      if (!burnAmount) {
        throw new Error("Invalid burn amount");
      }

      // TODO: get destination chain and address from the payload
      const destinationChain = "bitcoin-testnet";
      const mock20bytesAdress = `0x${"0".repeat(40)}`;

      setStatus("Estimating the fee");
      setIsBurning(true);

      const reponse = await axios.post("/api/unbond-tx-psbt", {
        btcStakerAddress: btcAddress,
        btcReceiverAddress: data.btcReceiverAddress,
        vaultTxHex: stakingTxHex,
      });

      const unsignedPsbtHex = reponse?.data?.psbt;
      if (!unsignedPsbtHex) {
        throw new Error(
          "Failed to get the unsigned psbt: " + reponse?.data?.error,
        );
      }
      setStatus("Signing the PSBT");
      // // Step 2: Sign the PSBT
      const hexSignedPsbt = await signPsbt(unsignedPsbtHex, {
        autoFinalized: false,
        toSignInputs: [
          {
            index: 0,
            address: btcAddress,
            disableTweakSigner: true,
          },
        ],
      });
      if (!hexSignedPsbt) {
        throw new Error("Failed to sign the psbt");
      }
      const signedPsbt = getPsbtByHex(hexSignedPsbt, btcAddress);
      // Step 3: Call the contract to burn the token
      setStatus("Approving the token");
      setIsBurning(true);

      const txApprove = await sBTC.approve(protocolContractAddress, burnAmount);

      setStatus("Waiting for approval transaction to be mined");

      const response = await txApprove.wait();

      console.log("response", response);

      await refetchAllowance();
      setStatus("Approval transaction mined");

      console.log({ allowance });

      setStatus("Burning the token");
      console.log({
        destinationChain,
        mock20bytesAdress,
        burnAmount,
        signedPsbt: signedPsbt.toBase64(),
      });
      const txBurn = await protocol.unstake(
        destinationChain,
        mock20bytesAdress,
        burnAmount,
        signedPsbt.toBase64(),
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

  return (
    <GeneralModal open={open} big onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Unstaked sBTC</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
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
                  BTC Staker Address
                </FormLabel>
                <Input disabled value={btcAddress} />
              </div>
              <div className="space-y-2 col-span-2">
                <FormLabel className="text-gray-500">
                  Token Return Address
                </FormLabel>
                <Input disabled value={address} />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-500">
                  BTC Staked Amount (sats)
                </FormLabel>
                <Input
                  disabled
                  value={getBondValueStringFromStakingTxHex(stakingTxHex)}
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-gray-500">Unstaked Amount</FormLabel>
                <Input disabled value={tokenBurnAmount} />
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
