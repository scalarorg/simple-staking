import { LoadingView } from "@/app/components/Loading/Loading";
import { fpTableStyles } from "@/app/scalar/theme";

import { useScalarClient } from "@/app/context/ScalarProvider";
import { Protocol } from "@/app/types/protocol";
import { ProtocolItem } from "./ProtocolItem";

export const ListProtocols: React.FC = () => {
  const { protocols } = useScalarClient();

  if (protocols.isLoading) {
    return <LoadingView />;
  }

  if (!protocols.data?.protocols) {
    return <div>No protocols found</div>;
  }

  return (
    <div className="flex flex-col gap-4 container mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">List of Protocols</h1>
      </div>
      <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
        <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-4 w-12">No</th>
                <th className="p-4 w-[200px]">Protocol Name</th>
                <th className="p-4 w-[150px]">Tag</th>
                {/* <th className="p-4">Custodian Group BTC Address</th> */}
                <th className="p-4">Status</th>
                <th className="p-4 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {protocols.data.protocols.map(
                (protocol: Protocol, index: number) => (
                  <ProtocolItem index={index} protocol={protocol} />
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
