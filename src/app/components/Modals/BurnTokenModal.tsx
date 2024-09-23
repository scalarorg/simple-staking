import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { networks } from "bitcoinjs-lib";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useAccount, useChainId, useConnect } from "wagmi";
import { z } from "zod";

import burnContractJSON from "@/abis/burn-contract.json";
import sBTCJSON from "@/abis/sbtc.json";
import { signInputs } from "@/app/common/utils/psbt";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { ProjectENV } from "@/env";
import { useEthersProvider, useEthersSigner } from "@/utils/ethers";
import { Network, UnisatOptions } from "@/utils/wallet/wallet_provider";

import { getPsbtByHex } from "vault/index";
import { toast } from "../ui/use-toast";

import { GeneralModal } from "./GeneralModal";

const burnContractABI = burnContractJSON.abi;
const sBTCABI = sBTCJSON.abi;

interface BurnTokenModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  btcAddress: string | undefined;
  signPsbt:
    | ((psbt: string, options?: UnisatOptions) => Promise<string>)
    | undefined;
  stakingTxHex: string;
  btcWalletNetwork: networks.Network;
}

const FormSchema = z.object({
  vaultTxHex: z.string({
    required_error: "Please enter your hex vault tx.",
  }),
  btcStakerAddress: z.string({
    required_error: "Please enter your btc staker address.",
  }),
  btcReceiverAddress: z.string({
    required_error: "Please enter your btc receiver address.",
  }),
});

export const BurnTokenModal: React.FC<BurnTokenModalProps> = ({
  open,
  onClose,
  btcAddress,
  signPsbt,
  stakingTxHex,
  btcWalletNetwork,
}) => {
  const network = ProjectENV.NEXT_PUBLIC_NETWORK;
  const mempool_web_url = ProjectENV.NEXT_PUBLIC_MEMPOOL_WEB;
  const tx_preview_prefix =
    network === Network.MAINNET || network === Network.REGTEST
      ? ""
      : "testnet/";
  const account = useAccount();
  const signer = useEthersSigner({ chainId: 1337 });
  const provider = useEthersProvider({ chainId: 1337 });

  console.log({ signer, provider });

  const [burnContract, setBurnContract] = useState<ethers.Contract | null>(
    null,
  );
  const [sBTCContract, setSBTCContract] = useState<ethers.Contract | null>(
    null,
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vaultTxHex: "",
      btcStakerAddress: "",
      btcReceiverAddress: "",
    },
  });

  useEffect(() => {
    if (provider && signer) {
      const burnContractAddress = ProjectENV.NEXT_PUBLIC_BURN_CONTRACT_ADDRESS;
      const sBTCContractAddress = ProjectENV.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS;

      if (!burnContractAddress || !sBTCContractAddress) {
        throw new Error("Missing contract address");
      }
      // Initialize contracts
      const burnContract = new ethers.Contract(
        burnContractAddress,
        burnContractABI,
        signer,
      );
      setBurnContract(burnContract);

      const sBTC = new ethers.Contract(sBTCContractAddress, sBTCABI, signer);
      setSBTCContract(sBTC);
    }
  }, [provider, signer]);

  useEffect(() => {
    if (btcAddress) {
      form.setValue("btcStakerAddress", btcAddress);
      form.setValue("btcReceiverAddress", btcAddress);
    }
    if (stakingTxHex) {
      form.setValue("vaultTxHex", stakingTxHex);
    }
  }, [btcAddress, stakingTxHex, form]);

  const [status, setStatus] = useState<string>("");
  const [isBurning, setIsBurning] = useState<boolean>(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const burnContractAddress = ProjectENV.NEXT_PUBLIC_BURN_CONTRACT_ADDRESS;
      const sBTCContractAddress = ProjectENV.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS;

      if (!burnContractAddress || !sBTCContractAddress) {
        throw new Error("Missing contract address");
      }

      const destinationChain = ProjectENV.NEXT_PUBLIC_BTC_CHAIN_NAME;
      const destinationAddress = ProjectENV.NEXT_PUBLIC_BTC_ADDRESS;

      if (!destinationChain || !destinationAddress) {
        throw new Error("Missing destination chain or address");
      }

      const burnAmount = ProjectENV.NEXT_PUBLIC_BURNING_AMOUNT;

      if (!burnAmount) {
        throw new Error("Missing burn amount");
      }

      if (sBTCContract === null || burnContract === null) {
        throw new Error("Contracts not initialized");
      }

      const { btcStakerAddress, btcReceiverAddress, vaultTxHex } = data;

      const url = window.location.origin;

      setStatus("Estimating the fee");
      setIsBurning(true);

      // Step 1: staker create unbonding transaction
      const unsignedPsbtResult = await axios.post(`${url}/api/unbond-tx-psbt`, {
        btcStakerAddress,
        btcReceiverAddress,
        vaultTxHex,
      });

      const unsignedUnbondPsbtHex =
        unsignedPsbtResult?.data?.data?.unsignedUnbondPsbtHex;

      if (!unsignedUnbondPsbtHex) {
        throw new Error(
          "Failed to get the unsigned psbt: " + unsignedPsbtResult?.data?.error,
        );
      }

      setStatus("Signing the PSBT");

      // Step 2: Sign the PSBT
      const hexSignedPsbt = await signPsbt!(unsignedUnbondPsbtHex, {
        autoFinalized: false,
        toSignInputs: [
          {
            index: 0,
            address: btcStakerAddress,
            disableTweakSigner: true,
          },
        ],
      });

      if (!hexSignedPsbt) {
        throw new Error("Failed to sign the psbt");
      }
      const signedPsbt = getPsbtByHex(hexSignedPsbt, btcStakerAddress);

      console.log({ txHex: hexSignedPsbt });
      console.log({ signedPsbt });

      // TODO: FINISH IMPLEMENT CALLING CONTRACT TO BURN THE TOKEN
      // Step 3: Call the contract to burn the token
      const amountToBurn = ethers.parseUnits(burnAmount, 18);

      setStatus("Approving the token");

      const txApprove = await sBTCContract.approve(
        burnContractAddress,
        amountToBurn,
      );
      const response = await txApprove.wait();
      console.log("response", response);

      setStatus("Burning the token");

      const txCallBurn = await burnContract.callBurn(
        destinationChain,
        destinationAddress,
        amountToBurn,
        signedPsbt.toBase64(),
      );
      await txCallBurn.wait();

      setStatus("Token burned successfully");

      // Unlock btc

      // Step 4: dApp service sign the transaction
      const serviceSignedPsbt = signInputs(
        ProjectENV.NEXT_PUBLIC_SERVICE_PRIVATE_KEY!,
        btcWalletNetwork,
        signedPsbt.toBase64(),
        true,
      );

      // Step 5: Push the transaction
      const hexTxFromPsbt = serviceSignedPsbt.extractTransaction().toHex();
      const result = await axios.post(`${url}/api/broadcast-btc-transaction`, {
        hexTxFromPsbt,
      });

      if (!result.data.data) {
        throw new Error("Failed to broadcast the transaction");
      }

      setStatus("Burn sBTC transaction sent successfully");
      onClose(false);

      toast({
        title: "Burn sBTC transaction sent successfully",
        description: (
          <div className="mt-2 w-[640px] rounded-md bg-slate-950">
            <p className="text-white">
              Txid:{" "}
              <Link
                className="text-blue-500 underline"
                href={`${mempool_web_url}/${tx_preview_prefix}tx/${result.data.data}`}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                {result.data.data.slice(0, 8)}...{result.data.data.slice(-8)}{" "}
                (click to view)
              </Link>
            </p>
          </div>
        ),
      });
    } catch (error) {
      setStatus("Failed to burn the token");
      setStatus(
        // @ts-ignore
        "Failed to burn the token: " + error?.message || JSON.stringify(error),
      );
      // toast({
      //   title: "Failed to burn the token: ",
      //   // @ts-ignore
      //   description: error?.message || "An error occurred",
      // });
      console.error(error);
    } finally {
      // setIsBurning(false);
      // const resetStatusTimeoutMs = 5000;
      // setTimeout(() => {
      //   setStatus("");
      // }, resetStatusTimeoutMs);
    }
  }

  return (
    <GeneralModal open={open} big onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Burn Token</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      {account.address ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="btcStakerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500">
                      BTC Staker Address
                    </FormLabel>
                    <FormControl>
                      <Input disabled placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel className="text-gray-500">
                  Token Holder Address
                </FormLabel>
                <Input disabled value={account.address} />
              </div>
            </div>

            <FormField
              control={form.control}
              name="btcReceiverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BTC Receiver Address</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaultTxHex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vault Tx Hex</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} disabled />
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
                  Burn sBTC
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
