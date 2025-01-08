import { Wallet } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/app/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Select } from "@/app/components/ui/select";
import { ProtocolChain } from "@/app/types/protocol";

import { TransferFormData } from "./schema";

interface DestinationChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: any;
  selectedDestChain: ProtocolChain | null;
  evmAddress?: string;
  onConnectWallet: () => void;
  watchTransferAmount: string;
}

export const DestinationChainSection = ({
  form,
  protocol,
  selectedDestChain,
  evmAddress,
  onConnectWallet,
  watchTransferAmount,
}: DestinationChainSectionProps) => {
  console.log({ evmAddress });
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2 -mt-2">
        <FormField
          control={form.control}
          name="destinationChain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination chain</FormLabel>
              <Select value={field.value} onChange={field.onChange}>
                <option value="" disabled>
                  Select chain
                </option>
                {protocol?.chains
                  .filter(
                    (chain: ProtocolChain) =>
                      chain.chain_name !== form.getValues("sourceChain"),
                  )
                  .map((chain: ProtocolChain) => (
                    <option key={chain.chain_name} value={chain.chain_name}>
                      {chain.chain_name}
                    </option>
                  ))}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="destRecipientAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recipient address</FormLabel>
            <div className="flex gap-2 items-center">
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (evmAddress) {
                    form.setValue("destRecipientAddress", evmAddress);
                    return;
                  }
                  onConnectWallet();
                }}
              >
                <Wallet className="w-4 h-4 text-orange-400" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>Receive amount</FormLabel>
        <Input
          inputMode="numeric"
          type="number"
          placeholder=""
          readOnly
          value={watchTransferAmount}
          className="focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none"
        />
      </div>

      {selectedDestChain?.supported_chain && (
        <div className="space-y-2">
          <FormLabel>Token address</FormLabel>
          <Input readOnly value={selectedDestChain.supported_chain.address} />
        </div>
      )}
    </div>
  );
};
