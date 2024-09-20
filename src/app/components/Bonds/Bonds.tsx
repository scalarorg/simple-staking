import { useQuery } from "@tanstack/react-query";
import { networks } from "bitcoinjs-lib";

import { getBonds } from "@/app/api/getBonds";
import { SignPsbtTransaction } from "@/app/common/utils/psbt";
import { historyContainerStyles } from "@/app/scalar/theme";
import { QueryMeta } from "@/app/types/api";
import { Bond as BondInterface } from "@/app/types/bonds";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { UnisatOptions, WalletProvider } from "@/utils/wallet/wallet_provider";

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
  // const [modalOpen, setModalOpen] = useState(false);
  // const [txID, setTxID] = useState("");
  // const [modalMode, setModalMode] = useState<MODE>();
  // const { showError } = useError();
  // const [burnTokenModalOpen, setBurnTokenModalOpen] = useState(false);

  // // Local storage state for intermediate bonds (withdrawing, unbonding)
  // const intermediateBondsLocalStorageKey =
  //   getIntermediateBondsLocalStorageKey(publicKeyNoCoord);

  // const [intermediateBondsLocalStorage, setIntermediateBondsLocalStorage] =
  //   useLocalStorage<BondInterface[]>(intermediateBondsLocalStorageKey, []);

  // Update the local storage with the new intermediate bond state
  // const updateLocalStorage = (bond: BondInterface, newState: string) => {
  //   setIntermediateBondsLocalStorage((bonds) => [
  //     toLocalStorageIntermediateBond(
  //       bond.stakingTxHashHex,
  //       publicKeyNoCoord,
  //       bond.finalityProviderPkHex,
  //       bond.stakingValueSat,
  //       bond.stakingTx.txHex,
  //       bond.stakingTx.timelock,
  //       newState,
  //     ),
  //     ...bonds,
  //   ]);
  // };

  // Handles unbonding requests for Active bonds that want to be withdrawn early
  // It constructs an unbonding transaction, creates a signature for it, and submits both to the back-end API
  // const handleUnbond = async (id: string) => {
  //   try {
  //     // Sign the unbonding transaction
  //     const { bond } = await signUnbondingTx(
  //       id,
  //       bondsAPI,
  //       publicKeyNoCoord,
  //       btcWalletNetwork,
  //       signPsbtTx,
  //     );
  //     // Update the local state with the new intermediate bond
  //     updateLocalStorage(bond, BondState.INTERMEDIATE_UNBONDING);
  //   } catch (error: Error | any) {
  //     showError({
  //       error: {
  //         message: error.message,
  //         errorState: ErrorState.UNBONDING,
  //         errorTime: new Date(),
  //       },
  //       retryAction: () => handleModal(id, MODE_UNBOND),
  //     });
  //   } finally {
  //     setModalOpen(false);
  //     setTxID("");
  //     setModalMode(undefined);
  //   }
  // };

  // Handles withdrawing requests for bonds that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it, and submits it to the Bitcoin network
  // const handleWithdraw = async (id: string) => {
  //   try {
  //     // Sign the withdrawal transaction
  //     const { bond } = await signWithdrawalTx(
  //       id,
  //       bondsAPI,
  //       globalParamsVersion,
  //       publicKeyNoCoord,
  //       btcWalletNetwork,
  //       signPsbtTx,
  //       address,
  //       getNetworkFees,
  //       pushTx,
  //     );
  //     // Update the local state with the new intermediate bond
  //     updateLocalStorage(bond, BondState.INTERMEDIATE_WITHDRAWAL);
  //   } catch (error: Error | any) {
  //     showError({
  //       error: {
  //         message: error.message,
  //         errorState: ErrorState.WITHDRAW,
  //         errorTime: new Date(),
  //       },
  //       retryAction: () => handleModal(id, MODE_WITHDRAW),
  //     });
  //   } finally {
  //     setModalOpen(false);
  //     setTxID("");
  //     setModalMode(undefined);
  //   }
  // };

  // const handleModal = (txID: string, mode: MODE) => {
  //   setModalOpen(true);
  //   setTxID(txID);
  //   setModalMode(mode);
  // };

  // useEffect(() => {
  //   if (!bondsAPI) {
  //     return;
  //   }

  //   setIntermediateBondsLocalStorage((intermediateBonds) => {
  //     if (!intermediateBonds) {
  //       return [];
  //     }

  //     return intermediateBonds.filter((intermediateBond) => {
  //       const matchingBond = bondsAPI.find(
  //         (bond) =>
  //           bond?.stakingTxHashHex === intermediateBond?.stakingTxHashHex,
  //       );

  //       if (!matchingBond) {
  //         return true; // keep intermediate state if no matching state is found in the API
  //       }

  //       // conditions based on intermediate states
  //       if (intermediateBond.state === BondState.INTERMEDIATE_UNBONDING) {
  //         return !(
  //           matchingBond.state === BondState.UNBONDING_REQUESTED ||
  //           matchingBond.state === BondState.UNBONDING ||
  //           matchingBond.state === BondState.UNBONDED
  //         );
  //       }

  //       if (intermediateBond.state === BondState.INTERMEDIATE_WITHDRAWAL) {
  //         return matchingBond.state !== BondState.WITHDRAWN;
  //       }

  //       return true;
  //     });
  //   });
  // }, [bondsAPI, setIntermediateBondsLocalStorage]);

  // // combine bonds from the API and local storage, prioritizing API data
  // const combinedBondsData = bondsAPI
  //   ? [...bondsLocalStorage, ...bondsAPI]
  //   : // if no API data, fallback to using only local storage bonds
  //     bondsLocalStorage;

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
                <th className="py-2">Destination Smartcontract Address</th>
                <th className="py-2">Amount</th>
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
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">
                    {bond.sourceTxHash.slice(0, 10)}...
                    {bond.sourceTxHash.slice(-4)}
                  </td>
                  <td className="py-2 px-4">{bond.simplifiedStatus}</td>
                  <td className="py-2 px-4">{bond.sourceChain}</td>
                  <td className="py-2 px-4">{bond.destinationChain}</td>
                  <td className="py-2 px-4">
                    {bond.destinationSmartContractAddress}
                  </td>
                  <td className="py-2 px-4">{bond.amount}</td>
                  <td className="py-2 px-4">{bond.createdAt}</td>
                  <td className="py-2 px-4">
                    {/* Add your action buttons or links here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {/* {modalMode && txID && (
          <UnbondWithdrawModal
            unbondingTimeBlocks={globalParamsVersion.unbondingTime}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onProceed={() => {
              modalMode === MODE_UNBOND
                ? handleUnbond(txID)
                : handleWithdraw(txID);
            }}
            mode={modalMode}
          />
        )} */}
    </div>
  );
};
