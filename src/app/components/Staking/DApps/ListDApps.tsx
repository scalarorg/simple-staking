// import { useState } from "react";

// import { LoadingView } from "@/app/components/Loading";
// import { useWalletInfo } from "@/app/context/WalletProvider";
// import { fpTableStyles } from "@/app/scalar/theme";
// import { useAddDAppModal } from "@/app/stores/modal";
// import { DApp } from "@/app/types/dApps";

// import { useScalarClient } from "@/app/context/ScalarProvider";
// import { DAppItem } from "./DAppItem";

// export const ListDApps: React.FC = () => {
//   const [selectedDApp, setSelectedDApp] = useState<DApp | undefined>(undefined);
//   const { open: openAddDAppModal } = useAddDAppModal();
//   const { address } = useWalletInfo();
//   const { dApps } = useScalarClient();

//   if (dApps.isLoading) {
//     return <LoadingView />;
//   }

//   if (!dApps.data?.dApps) {
//     return <div>No dApps found</div>;
//   }

//   return (
//     <div className="flex flex-col gap-4 container mx-auto w-full">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">List of dApps</h1>
//         {/* <button
//           className={`bg-orange-500 px-4 py-2 rounded-lg my-4 hover:bg-orange-600 transition-all duration-150 ${
//             !address ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           onClick={() => openAddDAppModal()}
//           disabled={!address}
//         >
//           Add
//         </button> */}
//       </div>
//       <div className={`flex flex-col gap-4 ${fpTableStyles}`}>
//         <div className="no-scrollbar max-h-[21rem] overflow-y-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left">
//                 <th className="p-4 w-12">No</th>
//                 <th className="p-4 w-[200px]">Chain Name</th>
//                 <th className="p-4 w-[150px]">Token</th>
//                 <th className="p-4">BTC Address</th>
//                 <th className="p-4">Smart Contract Address</th>
//                 <th className="p-4 w-20">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dApps.data.dApps.map((da: DApp, index: number) => (
//                 <DAppItem
//                   index={index}
//                   key={da.id}
//                   dApp={da}
//                   onClick={() => setSelectedDApp(da)}
//                   selected={selectedDApp?.id === da.id}
//                 />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
