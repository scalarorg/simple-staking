import Link from "next/link";
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
import { useWalletProvider } from "@/app/context/WalletProvider";
import { getDisplayedChainName } from "@/utils/scalar/chains";

import { isBtcChain, isEvmChain } from "../utils";
import { TransferFormData } from "./schema";

import { EVMConnectors } from "./EVMConnectors";

interface SourceChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: TProtocol;
  selectedSourceChain?: TProtocolChain;
  sourceTokenAddress: string | undefined;
  sourceChainAddress: string;
  gateway: string;
  lockingAddress: string;
}

export const SourceChainSection = ({
  form,
  protocol,
  selectedSourceChain,
  sourceTokenAddress,
  sourceChainAddress,
  gateway,
  lockingAddress,
}: SourceChainSectionProps) => {
  const { networkConfig } = useWalletProvider();
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
                {protocol?.chains?.map((chain: TProtocolChain) => (
                  <option key={chain.chain} value={chain.chain}>
                    {getDisplayedChainName(chain)}
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
              <EVMConnectors connectors={connectors} connect={connect} />
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
        <>
          <div className="space-y-2">
            <FormLabel>Token address</FormLabel>
            <Input readOnly value={sourceTokenAddress || ""} />
          </div>

          <div className="space-y-2">
            <FormLabel>Gateway</FormLabel>
            <Input readOnly value={gateway || ""} />
          </div>
        </>
      )}
      {isBtcChain(selectedSourceChain) && (
        <div className="space-y-2">
          <FormLabel>Locking address</FormLabel>
          <div className="flex flex-col gap-2">
            <Input readOnly value={lockingAddress || ""} />
            <Link
              href={`${networkConfig?.mempoolApiUrl}/address/${lockingAddress}`}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              View on mempool
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
