import { Wallet } from "lucide-react";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { useConnect } from "wagmi";

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

import { Button } from "../../ui/button";

import { TransferFormData } from "./schema";
import { isEvmChain } from "./utils";

interface SourceChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: any;
  selectedSourceChain: ProtocolChain | null;
  sourceTokenAddress: string | undefined;
  sourceChainAddress: string;
}

export const SourceChainSection = ({
  form,
  protocol,
  selectedSourceChain,
  sourceTokenAddress,
  sourceChainAddress,
}: SourceChainSectionProps) => {
  const { connect, connectors } = useConnect();

  return (
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

      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          <FormLabel>Source chain address</FormLabel>
          <FormControl>
            <Input
              readOnly
              value={sourceChainAddress}
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </FormControl>

          {isEvmChain(selectedSourceChain) && !sourceChainAddress && (
            <div className="flex flex-wrap gap-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  type="button"
                  variant="outline"
                  onClick={() => connect({ connector })}
                >
                  {connector.icon && (
                    <Image
                      src={connector.icon}
                      alt={`${connector.name} icon`}
                      className="rounded"
                      width={18}
                      height={18}
                    />
                  )}
                  {!connector.icon && (
                    <div className="flex items-center gap-2">
                      <Wallet className="w-[18px] h-[18px] text-orange-400" />
                      <span>{connector.name}</span>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
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
          <Input readOnly value={sourceTokenAddress || ""} />
        </div>
      )}
    </div>
  );
};
