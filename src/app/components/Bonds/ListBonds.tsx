import { useQuery } from "@tanstack/react-query";
import { Unlock } from "lucide-react";
import Link from "next/link";

import { getBonds } from "@/app/api/getBonds";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { useWalletInfo } from "@/app/context/WalletProvider";
import { fpStyles, fpTableStyles } from "@/app/scalar/theme";
import { useUnbondModal } from "@/app/stores/modal";
import { ProjectENV } from "@/env";
import { getRelativeTime } from "@/utils/tool";
import { hexStringWith0x } from "@/utils/trim";

const generalStyles = "cursor-pointer transition-shadow hover:shadow-md py-4";

export const ListBonds: React.FC = () => {
  const { pubkey } = useWalletInfo();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getListBonds", pubkey],
    queryFn: () => getBonds("bonds", pubkey),
    enabled: !!pubkey,
  });

  const { open } = useUnbondModal();

  const { client: scalarClient } = useScalarClient();

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
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="">
                <tr className="[&>*]:p-4">
                  <th>No</th>
                  <th>Source Chain</th>
                  <th>TxID</th>
                  <th>Dest. Chain</th>
                  <th>Dest. SC Address</th>
                  <th>Staked Amount (sats)</th>
                  <th>Time</th>
                  <th>Unstaked Amount (sats)</th>
                </tr>
              </thead>
              <tbody
                id="staking-history"
                className="no-scrollbar max-h-96 overflow-y-auto"
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
                    <td>{bond.destinationChain}</td>
                    <td>
                      {bond.destinationSmartContractAddress.slice(2, 6)}...
                      {bond.destinationSmartContractAddress.slice(-4)}
                    </td>
                    <td>{Number(bond.amount).toLocaleString()}</td>
                    <td>{getRelativeTime(bond.createdAt)}</td>
                    <td>
                      {!bond.executedAmount &&
                      scalarClient.isCustodianDApp(
                        hexStringWith0x(bond.destinationSmartContractAddress),
                      ) ? (
                        <div className="flex justify-center">
                          <button
                            className="btn btn-outline text-sm font-normal text-white p-1 px-2 flex items-center gap-2 border-white justify-center bg-gray-400 cursor-not-allowed"
                            disabled
                          >
                            Custodian - Unstaked
                          </button>
                        </div>
                      ) : !bond.executedAmount ? (
                        <div className="flex justify-center">
                          <button
                            className="btn btn-outline text-sm font-normal text-white p-1 px-2 flex items-center gap-2 border-white justify-center hover:bg-white hover:text-primary"
                            onClick={() => open(bond)}
                          >
                            <Unlock className="w-4 h-4" />
                            Unstaked
                          </button>
                        </div>
                      ) : (
                        <div className="font-normal text-white flex items-center justify-center">
                          <div className="p-2 flex items-center gap-2  bg-primary justify-center rounded-lg w-28">
                            {isNaN(Number(bond.executedAmount))
                              ? "N/A"
                              : Number(bond.executedAmount).toLocaleString()}
                          </div>
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
