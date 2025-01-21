import { WalletIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";

import { Button } from "@/app/components/ui/button";
import { Form } from "@/app/components/ui/form";

import { formatTokenAmount, isBtcChain } from "../utils";

import { TransferFormData } from "./schema";
import { DestinationChainSection } from "./DestinationChainSection";
import { SourceChainSection } from "./SourceChainSection";

interface TransferFormProps {
  form: UseFormReturn<TransferFormData>;
  handleSubmit: (data: TransferFormData) => void;
  sourceChain: TProtocolChain | undefined;
  destChain: TProtocolChain | undefined;
  sourceTokenAddress: string | undefined;
  watchSourceChainAddress: string;
  watchTransferAmount: string;
  onConnectWallet: () => void;
  sourceChainBalance: string | undefined;
  protocol: TProtocol;
  gatewayAddress: string | undefined;
  lockingAddress: string | undefined;
  isPending: boolean;
  evmAddress: string | undefined;
  availableUnstakedUtxos?: AddressTxsUtxo[];
  onSelectUtxo?: (utxo: AddressTxsUtxo) => void;
}

export const TransferForm = ({
  form,
  handleSubmit,
  sourceChain,
  destChain,
  sourceTokenAddress,
  watchSourceChainAddress,
  watchTransferAmount,
  onConnectWallet,
  sourceChainBalance,
  protocol,
  gatewayAddress,
  lockingAddress,
  isPending,
  evmAddress,
  availableUnstakedUtxos,
  onSelectUtxo,
}: TransferFormProps) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-4 w-full"
    >
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="col-span-1 flex items-center gap-2">
          <WalletIcon size={16} />
          {sourceChain && (
            <span className="text-sm font-bold text-orange-500">
              {sourceChainBalance
                ? formatTokenAmount(BigInt(sourceChainBalance), 8)
                : 0}{" "}
              $
              {(isBtcChain(sourceChain)
                ? "BTC"
                : protocol?.asset?.name
              )?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="col-span-1"></div>
        <SourceChainSection
          form={form}
          protocol={protocol}
          selectedSourceChain={sourceChain}
          sourceTokenAddress={sourceTokenAddress}
          sourceChainAddress={watchSourceChainAddress}
          gateway={gatewayAddress || ""}
          lockingAddress={lockingAddress || ""}
          availableUnstakedUtxos={availableUnstakedUtxos}
          onSelectUtxo={onSelectUtxo}
        />
        <DestinationChainSection
          form={form}
          protocol={protocol}
          selectedDestChain={destChain}
          onConnectWallet={onConnectWallet}
          watchTransferAmount={watchTransferAmount}
          sourceChain={sourceChain}
          evmAddress={evmAddress}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Transfer"}
        </Button>
      </div>
    </form>
  </Form>
);
