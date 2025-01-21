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
import { getDisplayedChainName } from "@/utils/scalar/chains";

import { isEvmChain } from "../utils";
import { EVMConnectors } from "./EVMConnectors";
import { TransferFormData } from "./schema";

interface DestinationChainSectionProps {
  form: UseFormReturn<TransferFormData>;
  protocol: TProtocol;
  selectedDestChain?: TProtocolChain;
  destRecipientAddress?: string;
  sourceChain?: TProtocolChain;
  watchTransferAmount: string;
  onConnectWallet: () => void;
  evmAddress?: string;
}

export const DestinationChainSection = ({
  form,
  protocol,
  selectedDestChain,
  watchTransferAmount,
  sourceChain,
  evmAddress,
  onConnectWallet,
}: DestinationChainSectionProps) => {
  const { connect, connectors } = useConnect();
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
                  ?.filter(
                    (chain: TProtocolChain) =>
                      chain.chain !== sourceChain?.chain,
                  )
                  .map((chain: TProtocolChain) => (
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
      <FormField
        control={form.control}
        name="destRecipientAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destination address</FormLabel>
            <div className="flex flex-col gap-2">
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              {isEvmChain(selectedDestChain) && !evmAddress && (
                <div className="flex flex-wrap gap-2">
                  <EVMConnectors connectors={connectors} connect={connect} />
                </div>
              )}
              {/* <Button
                type="button"
                variant="outline"
                disabled={
                  !selectedDestChain ||
                  (isEvmChain(selectedDestChain) && !evmAddress)
                }
                onClick={onConnectWallet}
              >
                <Wallet className="w-4 h-4 text-orange-400" />
              </Button> */}
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
