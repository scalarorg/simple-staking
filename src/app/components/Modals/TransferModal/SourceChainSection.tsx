import { UseFormReturn } from "react-hook-form";

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
import { isEvmChain } from "./utils";

interface SourceChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: any;
  selectedSourceChain: ProtocolChain | null;
  sourceTokenAddress: string;
}

export const SourceChainSection = ({
  form,
  protocol,
  selectedSourceChain,
  sourceTokenAddress,
}: SourceChainSectionProps) => (
  <div className="space-y-4 w-full">
    <div className="space-y-2 -mt-2">
      <FormField
        control={form.control}
        name="sourceChain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source chain</FormLabel>
            <Select value={field.value} onChange={field.onChange}>
              <option value="" disabled>
                Select chain
              </option>
              {protocol?.chains.map((chain: ProtocolChain) => (
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

    <div className="space-y-2">
      <FormLabel>Source chain address</FormLabel>
      <FormControl>
        <Input readOnly value={selectedSourceChain?.supported_chain.address} />
      </FormControl>
    </div>

    <FormField
      control={form.control}
      name="transferAmount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transfer amount</FormLabel>
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

    {isEvmChain(selectedSourceChain) && (
      <div className="space-y-2">
        <FormLabel>Token address</FormLabel>
        <Input readOnly value={sourceTokenAddress} />
      </div>
    )}
  </div>
);
