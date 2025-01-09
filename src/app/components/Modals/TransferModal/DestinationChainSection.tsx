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

import { TransferFormData } from "./schema";
import { isBtcChain } from "./utils";

interface DestinationChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: TProtocol;
  selectedDestChain?: TProtocolChain;
  destRecipientAddress?: string;
  sourceChain?: TProtocolChain;
  watchTransferAmount: string;
  onConnectWallet: () => void;
}

export const DestinationChainSection = ({
  form,
  protocol,
  selectedDestChain,
  watchTransferAmount,
  sourceChain,
  onConnectWallet,
}: DestinationChainSectionProps) => {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2 -mt-2">
        <FormField
          control={form.control}
          name="destinationChain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination chain</FormLabel>
              <Select
                value={field.value}
                onChange={field.onChange}
                disabled={isBtcChain(selectedDestChain)}
              >
                <option value="" disabled>
                  Select chain
                </option>
                {protocol?.chains
                  ?.filter(
                    (chain: TProtocolChain) =>
                      chain.chain !== sourceChain?.chain && !isBtcChain(chain),
                  )
                  .map((chain: TProtocolChain) => (
                    <option key={chain.chain} value={chain.chain}>
                      {chain.chain}
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
            <FormLabel>Destination address</FormLabel>
            <div className="flex gap-2 items-center">
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                disabled={!selectedDestChain}
                onClick={onConnectWallet}
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

      {selectedDestChain?.address && (
        <div className="space-y-2">
          <FormLabel>Token address</FormLabel>
          <Input readOnly value={selectedDestChain.address} />
        </div>
      )}
    </div>
  );
};
