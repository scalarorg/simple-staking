import { useQuery } from "@tanstack/react-query";

import { LoadingView } from "@/app/components/Loading/Loading";
import { useScalarClient } from "@/app/context/ScalarProvider";
import { fpTableStyles } from "@/app/scalar/theme";
import { useAddCustodianGroupModal } from "@/app/stores/modal";
import { CustodianGroup } from "@/app/types/custodians";

import { CustodianGroupItem } from "./CustodianGroupItem";

export const CustodianGroups: React.FC = () => {
  const { open: openAddCustodianGroupModal } = useAddCustodianGroupModal();
  const scalarClient = useScalarClient();

  const { data: custodianGroups, isLoading } = useQuery({
    queryKey: ["getCustodianGroups"],
    queryFn: () => scalarClient.client.getCustodianGroups(),
    retry: (failureCount, error) => {
      return failureCount <= 3;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return <LoadingView />;
  }

  if (!custodianGroups) {
    return <div>No custodian groups found</div>;
  }

  return (
    <div className="flex flex-col gap-4 container mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">List of Custodian Groups</h1>
        <button
          className={`bg-orange-500 px-4 py-2 rounded-lg my-4 hover:bg-orange-600 transition-all duration-150`}
          onClick={() => openAddCustodianGroupModal()}
        >
          Add
        </button>
      </div>
      <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
        <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-4 w-12">No</th>
                <th className="p-4 w-[200px]">Custodian Group Name</th>
                {/* <th className="p-4 w-[150px]">BTC Network</th>
                <th className="p-4">Taproot Address</th> */}
                <th className="p-4">Quorum</th>
                <th className="p-4">Number of Custodians</th>
                <th className="p-4 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {custodianGroups.data.map(
                (custodianGroup: CustodianGroup, index: number) => (
                  <CustodianGroupItem
                    key={index}
                    index={index}
                    custodianGroup={custodianGroup}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
