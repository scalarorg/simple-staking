import { AddressTxsUtxo } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";
import Link from "next/link";
import React from "react";

import { useWalletProvider } from "@/app/context/WalletProvider";
import { FormLabel } from "@/app/components/ui/form";

import { formatTokenAmount } from "../utils";

interface AvailableUtxosProps {
  utxos: AddressTxsUtxo[];
  onSelectUtxo?: (selectedUtxo: AddressTxsUtxo) => void;
}

export const AvailableUtxos: React.FC<AvailableUtxosProps> = ({
  utxos,
  onSelectUtxo,
}) => {
  const { networkConfig } = useWalletProvider();

  return (
    <div className="space-y-4 p-4 bg-[#0a0a0a] rounded-md">
      <FormLabel className="font-semibold">Available Utxos</FormLabel>
      <ul className="divide-y divide-gray-300 h-48 overflow-y-auto">
        {utxos.map((utxo) => (
          <li
            key={utxo.txid}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                name="utxo"
                value={utxo.txid}
                onChange={() => onSelectUtxo?.(utxo)}
                className="form-radio cursor-pointer"
              />
              <Link
                href={`${networkConfig?.mempoolApiUrl}/tx/${utxo.txid}`}
                className="font-mono text-sm text-blue-500 hover:underline"
                target="_blank"
              >
                {utxo.txid.slice(0, 15)}...{utxo.txid.slice(-15)}
              </Link>
            </div>
            <span className="text-sm text-gray-300 font-semibold">
              <span className="font-mono text-sm text-orange-500 mr-2">
                {formatTokenAmount(BigInt(utxo.value))}
              </span>
              BTC
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
