import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useAccount } from "wagmi";
import { z } from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { toast } from "@/app/components/ui/use-toast";
import { cn } from "@/utils";

import Mainnet from "@/../chains/mainnet.json";
import Testnet from "@/../chains/testnet.json";
import { getFeesRecommended } from "bitcoin-flow/utils/mempool";
import { Staker, UTXO, getPsbtByHex, getUTXOs } from "vault/index";

import { GeneralModal } from "./GeneralModal";

interface SendTxModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  btcAddress: string | undefined;
  btcPublicKey: string | undefined;
  signPsbt: ((psbt: string) => Promise<string>) | undefined;
}

const FormSchema = z.object({
  sourceChainAddress: z.string({
    required_error: "Please enter your source chain address.",
  }),
  sourceChainPublicKey: z.string({
    required_error: "Please enter your source chain public key.",
  }),
  destinationChainId: z.string({
    required_error: "Please select a chain.",
  }),
  destinationChainAddress: z.string({
    required_error: "Please enter your destination chain address.",
  }),
  smartContractAddress: z.string({
    required_error: "Please enter your smart contract address.",
  }),
  stakingAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive({
      message: "Please enter a positive number.",
    }),
  mintingAmount: z.coerce
    .number({
      required_error: "Please enter the amount.",
    })
    .positive({
      message: "Please enter a positive number.",
    }),
  quorum: z.coerce.number({
    required_error: "Please enter the quorum.",
  }),
  tag: z.string({
    required_error: "Please enter the tag.",
  }),
  version: z.coerce.number({
    required_error: "Please enter the version.",
  }),
  covenantPublicKeys: z.array(z.string()),
  servicePublicKey: z.string({
    required_error: "Please enter your service public key.",
  }),
});

export const MintTxModal: React.FC<SendTxModalProps> = ({
  open,
  onClose,
  btcAddress,
  btcPublicKey,
  signPsbt,
}) => {
  let network = process.env.NEXT_PUBLIC_NETWORK!;

  let chains;
  if (network === "mainnet") {
    chains = Mainnet.chains;
  } else {
    chains = Testnet.chains;
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sourceChainAddress: "",
      sourceChainPublicKey: "",
      destinationChainId: "",
      destinationChainAddress: "",
      smartContractAddress: "",
      stakingAmount: 0,
      mintingAmount: 0,
      quorum: Number(process.env.NEXT_PUBLIC_QUORUM!) || 0,
      tag: process.env.NEXT_PUBLIC_TAG!,
      version: Number(process.env.NEXT_PUBLIC_VERSION!) || 0,
      covenantPublicKeys: process.env.NEXT_PUBLIC_COVENANT_PUBKEYS!.split(","),
      servicePublicKey: process.env.NEXT_PUBLIC_SERVICE_PUBKEY!,
    },
  });

  useEffect(() => {
    if (btcAddress && btcPublicKey) {
      form.setValue("sourceChainAddress", btcAddress);
      form.setValue("sourceChainPublicKey", btcPublicKey);
    }
  }, [btcAddress, btcPublicKey, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const {
      sourceChainAddress,
      sourceChainPublicKey,
      servicePublicKey,
      smartContractAddress,
      mintingAmount,
      version,
      tag,
      covenantPublicKeys,
      quorum,
      destinationChainAddress,
      destinationChainId,
      stakingAmount,
    } = data;
    try {
      const staker = new Staker(
        sourceChainAddress,
        sourceChainPublicKey,
        servicePublicKey,
        covenantPublicKeys,
        quorum,
        tag,
        version,
        destinationChainId,
        destinationChainAddress,
        smartContractAddress,
        mintingAmount,
      );

      const regularUTXOs: UTXO[] = await getUTXOs(sourceChainAddress);

      let feeRate = (await getFeesRecommended()).fastestFee + 1; // Get this from Mempool API
      const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low
      const { psbt: unsignedVaultPsbt, feeEstimate: fee } =
        await staker.getUnsignedVaultPsbt(
          regularUTXOs,
          stakingAmount,
          feeRate,
          rbf,
        );

      // Simulate signing
      const hexSignedPsbt = await signPsbt?.(unsignedVaultPsbt.toHex());

      if (!hexSignedPsbt) {
        console.error("Failed to sign the psbt");
        return;
      }

      const signedPsbt = getPsbtByHex(hexSignedPsbt, sourceChainAddress);

      // --- Sign with staker
      const hexTxFromPsbt = signedPsbt.extractTransaction().toHex();

      // UNISAT have api for user to sign this psbt and finalize it
      // this demo: https://demo.unisat.io/
      // It support sign psbt, push psbt or push tx to bitcoin network

      // Test mempool acceptance
      const url = window.location.origin;
      const result = await axios.post(`${url}/api/test-transaction`, {
        hexTxFromPsbt,
      });

      toast({
        title: "Test mempool acceptance",
        description: (
          <pre className="mt-2 w-[640px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(result.data, null, 2)}
            </code>
          </pre>
        ),
      });

      // Send to bitcoin network
      // await utils.node.sendToBitcoinNetwork(process.env.url!, hexTxfromPsbt);
    } catch (error) {
      toast({
        title: "Error",
        // @ts-ignore
        description: error?.message || "An error occurred",
      });
    }
  }

  const account = useAccount();

  return (
    <GeneralModal open={open} big onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Mint Token</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <div className="flex gap-4 w-full">
            <div className="space-y-4 w-full">
              <div className="space-y-2 -mt-2">
                <FormLabel className="text-gray-500">Source chain</FormLabel>
                <Input disabled value={"Bitcoin"} />
              </div>

              <FormField
                control={form.control}
                name="sourceChainAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500">
                      Source chain address
                    </FormLabel>
                    <FormControl>
                      <Input disabled placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stakingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staking amount (sats)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        step="any"
                        type="number"
                        placeholder=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 w-full">
              <FormField
                control={form.control}
                name="destinationChainId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Destination chain</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? chains.find(
                                  (chain) => chain.chainId === field.value,
                                )?.name
                              : "Select chain"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search chain..." />
                          <CommandList>
                            <CommandEmpty>No chain found.</CommandEmpty>
                            <CommandGroup>
                              {chains.map((chain) => (
                                <CommandItem
                                  value={chain.chainId}
                                  key={chain.chainId}
                                  onSelect={async () => {
                                    form.setValue(
                                      "destinationChainId",
                                      chain.chainId,
                                    );

                                    if (account.status === "connected") {
                                      form.setValue(
                                        "destinationChainAddress",
                                        account.address?.toString() || "",
                                      );
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      chain.chainId === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {chain.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationChainAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token receiver address</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mintingAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minting amount (sBTC)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        step="any"
                        type="number"
                        placeholder=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="space-y-2 py-3">
            <h3 className="text-base font-medium">dApp infomation</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="servicePublicKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BTC Service Pubkey</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smartContractAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Smart contract address</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="" variant="outline" type="submit">
              Mint sBTC
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
