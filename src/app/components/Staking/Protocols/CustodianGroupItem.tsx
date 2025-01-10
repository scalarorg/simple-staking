// import { BookOpen } from "lucide-react";

// import { useWalletInfo } from "@/app/context/WalletProvider";
// import { fpStyles } from "@/app/scalar/theme";
// import { useCustodianGroupModal } from "@/app/stores/modal";
// import { CustodianGroup } from "@/app/types/custodians";

// interface CustodianGroupProps {
//   index: number;
//   custodianGroup: CustodianGroup;
// }

// export const CustodianGroupItem: React.FC<CustodianGroupProps> = ({
//   custodianGroup,
//   index,
// }) => {
//   const generalStyles = "cursor-pointer transition-shadow hover:shadow-md";

//   const dAppHasData = custodianGroup.Name;
//   const { open } = useCustodianGroupModal();
//   const { address } = useWalletInfo();

//   return (
//     <tr
//       className={`
//         ${generalStyles}
//         ${dAppHasData ? "" : "opacity-50 pointer-events-none"}
//         ${fpStyles}
//         `}
//     >
//       <td className="p-4">{index + 1}</td>
//       <td className="p-4">{custodianGroup.Name}</td>
//       {/* <td className="p-4">{custodianGroup.BtcNetwork}</td>
//       <td className="p-4">
//         {custodianGroup.TaprootAddress.slice(0, 8)}...
//         {custodianGroup.TaprootAddress.slice(-4)}
//       </td> */}
//       <td className="p-4">{custodianGroup.Quorum}</td>
//       <td className="p-4">{custodianGroup.Custodians.length}</td>
//       <td className="p-4">
//         <div className="flex gap-2 items-center">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               open(custodianGroup);
//             }}
//             className={`px-2 hover:text-orange-600 flex items-center gap-2 justify-center ${
//               !address ? "opacity-50 pointer-events-none" : ""
//             }`}
//             disabled={!address}
//           >
//             Edit
//             <BookOpen size={12} />
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };
