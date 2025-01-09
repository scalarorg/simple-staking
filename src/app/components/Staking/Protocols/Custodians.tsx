// import { useQuery } from "@tanstack/react-query";

// import { LoadingView } from "@/app/components/Loading/Loading";
// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { fpTableStyles } from "@/app/scalar/theme";
// import { Custodian } from "@/app/types/custodians";

// export const Custodians: React.FC = () => {
//   const scalarClient = useScalarClient();

//   const { data: custodians, isLoading } = useQuery({
//     queryKey: ["getCustodians"],
//     queryFn: () => scalarClient.client.getCustodians(),
//     retry: (failureCount, error) => {
//       return failureCount <= 3;
//     },
//     refetchInterval: 60000,
//   });

//   if (isLoading) {
//     return <LoadingView />;
//   }

//   if (!custodians) {
//     return <div>No custodians found</div>;
//   }

//   return (
//     <div className="flex flex-col gap-4 container mx-auto w-full">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">List of Custodians</h1>
//       </div>
//       <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
//         <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left">
//                 <th className="p-4 w-12">No</th>
//                 <th className="p-4 w-[200px]">Name</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">BTC Public Key</th>
//                 <th className="p-4">Description</th>
//               </tr>
//             </thead>
//             <tbody>
//               {custodians.data.map((custodian: Custodian, index: number) => (
//                 <tr key={index}>
//                   <td className="p-4">{index + 1}</td>
//                   <td className="p-4">{custodian.Name}</td>
//                   <td className="p-4">{custodian.Status}</td>
//                   <td className="p-4">
//                     {Buffer.from(custodian.BtcPublicKey).toString("hex")}
//                   </td>
//                   <td className="p-4">{custodian.Description}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
