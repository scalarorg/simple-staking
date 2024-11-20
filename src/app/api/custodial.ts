// export const getCustodialGroups = async (): Promise<{
//   custodialGroups: CustodialGroup[];
// }> => {
//   const response = await apiWrapper(
//     "GET",
//     "/v1/custodial/group",
//     "Error getting custodial groups",
//   );
//   const custodialGroupsAPIResponse: CustodialGroupsAPIResponse = response.data;
//   const custodialGroupsAPI: CustodialGroupAPI[] =
//     custodialGroupsAPIResponse.data;

//   const custodialGroups = custodialGroupsAPI.map(
//     (cg: CustodialGroupAPI): CustodialGroup => {
//       return {
//         id: cg.ID,
//         name: cg.Name,
//         description: cg.Description,
//         state: cg.State,
//       };
//     },
//   );

//   return { custodialGroups };
// };

export const getCustodialGroupNames = async (): Promise<{
  groupNames: string[];
}> => {
  // TODO: uncomment this after xchains-api is done implementing the custodial group names
  //   const response = await apiWrapper(
  //     "GET",
  //     "/v1/custodial/group/names",
  //     "Error getting custodial group names",
  //   );
  //   return response.data;
  return { groupNames: ["All"] };
};
