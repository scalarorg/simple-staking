import ScalarAPI from "@/apis/scalar";
import { fpTableStyles } from "@/app/scalar/theme";

import { LoadingView } from "../../Loading/Loading";

import { ProtocolItem } from "./ProtocolItem";

export const ListProtocols: React.FC = () => {
  const { data, isLoading } = ScalarAPI.useQuery(
    "get",
    "/scalar/protocol/v1beta1",
    {},
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (!isLoading && (!data?.protocols || data?.protocols.length === 0)) {
    return <div>No protocols found</div>;
  }

  console.log({ data });

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
                <th className="p-4">Type</th>
                {/* <th className="p-4">Custodian Group BTC Address</th> */}
                <th className="p-4">Status</th>
                <th className="p-4 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.protocols?.map((protocol, index: number) => (
                <ProtocolItem key={index} index={index} protocol={protocol} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
