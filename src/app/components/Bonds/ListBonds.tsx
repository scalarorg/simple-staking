import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getBonds } from "@/app/api/getBonds";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles, fpTableStyles } from "@/app/scalar/theme";
import { useUnbondModal } from "@/app/stores/modal";
import { ProjectENV } from "@/env";
import { getBondValueStringFromStakingTxHex } from "@/utils/bitcoin";
import { getRelativeTime } from "@/utils/tool";

const generalStyles = "cursor-pointer transition-shadow hover:shadow-md py-4";

export const ListBonds: React.FC = () => {
  const { pubkey } = useWalletInfo();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bonds", pubkey],
    queryFn: () => getBonds("bonds", pubkey),
    enabled: !!pubkey,
  });

  const { open } = useUnbondModal();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 container mx-auto w-full space-y-4">
      <h1 className="text-2xl font-bold">Bonding history</h1>
      {(isError || !data || data.bonds.length === 0) && (
        <div className="rounded-2xl border border-neutral-content p-4 text-center dark:border-neutral-content/20">
          <p>No history found</p>
        </div>
      )}
      {data && data.bonds.length > 0 && (
        <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
          <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
            <table className="min-w-full">
              <thead className="">
                <tr className="[&>*]:p-4">
                  <th>No</th>
                  <th>Source Chain</th>
                  <th>TxID</th>
                  <th>Amount (sats)</th>
                  <th>Dest. Chain</th>
                  <th>Dest. SC Address</th>
                  <th>Minted Amount</th>
                  <th>Time</th>
                  <th>Unbonded $BTC</th>
                </tr>
              </thead>
              <tbody
                id="staking-history"
                className="no-scrollbar max-h-[21rem] overflow-y-auto"
              >
                {data.bonds.map((bond, index) => (
                  <tr
                    key={bond.id}
                    className={`${generalStyles} ${fpStyles} [&>*]:p-4 [&>*]:text-center my-4`}
                  >
                    <td>{index + 1}</td>
                    <td>{bond.sourceChain}</td>
                    <td>
                      <Link
                        className="text-blue-500 underline"
                        href={`${ProjectENV.NEXT_PUBLIC_SCALAR_SCANNER}/gmp/${bond.sourceTxHash}`}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                      >
                        {bond.sourceTxHash.slice(2, 6)}...
                        {bond.sourceTxHash.slice(-4)}
                      </Link>
                    </td>
                    <td>
                      {getBondValueStringFromStakingTxHex(bond.sourceTxHex)}
                    </td>
                    <td>{bond.destinationChain}</td>
                    <td>
                      {bond.destinationSmartContractAddress.slice(2, 6)}...
                      {bond.destinationSmartContractAddress.slice(-4)}
                    </td>
                    <td>{Number(bond.amount).toLocaleString()}</td>
                    <td>{getRelativeTime(bond.createdAt)}</td>
                    <td>
                      {!bond.executedAmount && (
                        <button
                          className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
                          onClick={() => open(bond)}
                        >
                          Unbond
                        </button>
                      )}
                      {bond.executedAmount && (
                        <div className="text-white flex gap-2">
                          Unbonded:
                          <span className="text-orange-700 bg-white rounded-lg px-2">
                            {bond.executedAmount}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
