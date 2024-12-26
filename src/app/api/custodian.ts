import {
  ShortenCustodianGroup,
  ShortenCustodianGroupsAPIResponse,
} from "../types/custodials";

import { apiWrapper } from "./apiWrapper";

export const getShortenCustodianGroups = async (): Promise<{
  shortenCustodianGroups: ShortenCustodianGroup[];
}> => {
  const response = await apiWrapper(
    "GET",
    "/v1/custodial/groups/shorten",
    "Error getting shorten custodian groups",
  );
  const shortenCustodianGroupsAPIResponse: ShortenCustodianGroupsAPIResponse =
    response.data;
  const shortenCustodianGroupsAPI: ShortenCustodianGroup[] =
    shortenCustodianGroupsAPIResponse.data;
  return { shortenCustodianGroups: shortenCustodianGroupsAPI };
};
