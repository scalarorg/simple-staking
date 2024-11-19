"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useAccount } from "wagmi";
import { z } from "zod";

import { useWalletInfo } from "@/app/context/WalletProvider";
import { useUnstakeCustodialModal } from "@/app/stores/modal";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import { GeneralModal } from "./GeneralModal";

// Define your form schema
const FormSchema = z.object({
  btcReceiverAddress: z
    .string({
      required_error: "Please enter your btc receiver address.",
    })
    .min(12, "Invalid BTC address"),
  unstakeAmount: z
    .string({
      required_error: "Please enter unstake amount.",
    })
    .min(1, "Amount must be greater than 0"),
});

export const UnstakeCustodialModal: React.FC = () => {
  const { address } = useAccount();
  const isOpen = useUnstakeCustodialModal((state) => state.isOpen);
  const close = useUnstakeCustodialModal((state) => state.close);
  const { address: btcAddress } = useWalletInfo();

  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      btcReceiverAddress: btcAddress,
      unstakeAmount: "",
    },
  });

  useEffect(() => {
    if (!form.getValues("btcReceiverAddress")) {
      form.setValue("btcReceiverAddress", btcAddress);
    }
  }, [btcAddress, form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsProcessing(true);
      setStatus("Processing unstake request...");

      // Add your unstaking logic here

      close();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setStatus("");
    }
  }

  return (
    <GeneralModal open={isOpen} onClose={close}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Unstake Custodial</h3>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={close}>
          <IoMdClose size={24} />
        </button>
      </div>

      {address ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-gray-500">Ethereum Address</FormLabel>
              <Input readOnly value={address} />
            </div>

            <FormField
              control={form.control}
              name="unstakeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unstake Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="btcReceiverAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BTC Receiver Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter BTC address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-4">
              {isProcessing && <Loader2 size={32} className="animate-spin" />}
              {status && <div className="max-w-md break-words">{status}</div>}
            </div>

            {!isProcessing && (
              <div className="flex justify-end">
                <Button variant="outline" type="submit">
                  Unstake
                </Button>
              </div>
            )}
          </form>
        </Form>
      ) : (
        <div>Please connect your wallet</div>
      )}
    </GeneralModal>
  );
};
