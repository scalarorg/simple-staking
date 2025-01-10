// import { LoadingView } from "@/app/components/Loading";
// import { ManageProtocolsItem } from "@/app/components/Staking/Protocols/ManageProtocolsItem";
// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { fpTableStyles } from "@/app/scalar/theme";
// import { useAddProtocolModal } from "@/app/stores/modal";
// import { Protocol } from "@/app/types/protocol";

// export const ManageProtocols: React.FC = () => {
//   const { protocols } = useScalarClient();
//   const { open: openAddProtocolModal } = useAddProtocolModal();

//   if (protocols.isLoading) {
//     return <LoadingView />;
//   }

//   if (!protocols.data?.protocols) {
//     return <div>No protocols found</div>;
//   }

//   return (
//     <div className="flex flex-col gap-4 container mx-auto w-full">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">List of Protocols</h1>
//         <button
//           className={`bg-orange-500 px-4 py-2 rounded-lg my-4 hover:bg-orange-600 transition-all duration-150`}
//           onClick={() => openAddProtocolModal()}
//         >
//           Add
//         </button>
//       </div>
//       <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
//         <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left">
//                 <th className="p-4 w-12">No</th>
//                 <th className="p-4 w-[200px]">Protocol Name</th>
//                 <th className="p-4 w-[150px]">Tag</th>
//                 <th className="p-4">Custodian Group BTC Address</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Custodian Only</th>
//                 <th className="p-4 w-20">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {protocols.data.protocols.map(
//                 (protocol: Protocol, index: number) => (
//                   <ManageProtocolsItem
//                     key={index}
//                     index={index}
//                     protocol={protocol}
//                   />
//                 ),
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
