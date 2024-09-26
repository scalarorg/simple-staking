import { useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";
import Link from "next/link";
import { useState } from "react";

import { getBonds } from "@/app/api/getBonds";
import { SignPsbtTransaction } from "@/app/common/utils/psbt";
import { historyContainerStyles } from "@/app/scalar/theme";
import { QueryMeta } from "@/app/types/api";
import { Bond as BondInterface } from "@/app/types/bonds";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getBondValueStringFromStakingTxHex } from "@/utils/bitcoin";
import { datetimeStringOf } from "@/utils/formatTime";
import { mempoolWebTxUrl } from "@/utils/mempool_api";
import { UnisatOptions, WalletProvider } from "@/utils/wallet/wallet_provider";

import { BurnTokenModal } from "../Modals/BurnTokenModal";

type signedPsbtFunctionType =
  | ((psbt: string) => Promise<string>)
  | ((
      psbt: string,
      options?: UnisatOptions,
      privateKey?: string,
    ) => Promise<string>)
  | undefined;

interface BondsProps {
  finalityProvidersKV: Record<string, string>;
  bondsAPI: BondInterface[];
  bondsLocalStorage: BondInterface[];
  globalParamsVersion: GlobalParamsVersion;
  publicKeyNoCoord: string;
  btcWalletNetwork: networks.Network;
  address: string;
  signPsbtTx: SignPsbtTransaction;
  pushTx: WalletProvider["pushTx"];
  queryMeta: QueryMeta;
  getNetworkFees: WalletProvider["getNetworkFees"];
  signPsbt: signedPsbtFunctionType;
}

export const Bonds: React.FC<BondsProps> = ({
  finalityProvidersKV,
  bondsAPI,
  bondsLocalStorage,
  globalParamsVersion,
  publicKeyNoCoord,
  btcWalletNetwork,
  address,
  signPsbtTx,
  pushTx,
  queryMeta,
  getNetworkFees,
  signPsbt,
}) => {
  const [burnTokenModalOpen, setBurnTokenModalOpen] = useState(false);
  const [txHex, setTxHex] = useState("");

  const handleModal = (txHex: string) => {
    setTxHex(txHex);
    setBurnTokenModalOpen(true);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bonds", publicKeyNoCoord],
    queryFn: () => getBonds("bonds", publicKeyNoCoord),
    enabled: !!publicKeyNoCoord,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`
          card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1
          ${historyContainerStyles}
          `}
    >
      <h3 className="mb-4 font-bold">Bonding history</h3>
      {isError ||
        (!data && (
          <div className="rounded-2xl border border-neutral-content p-4 text-center dark:border-neutral-content/20">
            <p>No history found</p>
          </div>
        ))}
      {
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="">
              <tr>
                <th className="py-2">No</th>
                <th className="py-2">TxHash</th>
                <th className="py-2">Status</th>
                <th className="py-2">Source Chain</th>
                <th className="py-2">Destination Chain</th>
                <th className="py-2">Dest. SC Address</th>
                <th className="py-2">Amount (sats)</th>
                <th className="py-2">Created At</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody
              id="staking-history"
              className="no-scrollbar max-h-[21rem] overflow-y-auto"
            >
              {data?.bonds.map((bond, index) => (
                <tr key={bond.id} className="border-b">
                  <td className="py-2 px-4 text-center">{index + 1}</td>
                  <td className="py-2 px-4 text-center">
                    <Link
                      className="text-blue-500 underline"
                      href={mempoolWebTxUrl(bond.sourceTxHash.slice(2))}
                      target="_blank"
                      rel="noreferrer noopener nofollow"
                    >
                      {bond.sourceTxHash.slice(2, 6)}...
                      {bond.sourceTxHash.slice(-4)}
                    </Link>
                  </td>
                  <td className="py-2 px-4 text-center">
                    {bond.simplifiedStatus}
                  </td>
                  <td className="py-2 px-4 text-center">{bond.sourceChain}</td>
                  <td className="py-2 px-4 text-center">
                    {bond.destinationChain}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {bond.destinationSmartContractAddress.slice(2, 6)}...
                    {bond.destinationSmartContractAddress.slice(-4)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {getBondValueStringFromStakingTxHex(bond.sourceTxHex)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {datetimeStringOf(bond.createdAt)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
                      onClick={() => handleModal(bond.sourceTxHex)}
                    >
                      Unbond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      <BurnTokenModal
        open={burnTokenModalOpen}
        onClose={setBurnTokenModalOpen}
        btcAddress={address}
        signPsbt={signPsbt}
        stakingTxHex={txHex}
      />
    </div>
  );
};
