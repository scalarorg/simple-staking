import {
  ShortenCustodialGroup,
  ShortenCustodialGroupsAPIResponse,
} from "../types/custodials";

import { apiWrapper } from "./apiWrapper";

export const getShortenCustodialGroups = async (): Promise<{
  shortenCustodialGroups: ShortenCustodialGroup[];
}> => {
  const response = await apiWrapper(
    "GET",
    "/v1/custodial/groups/shorten",
    "Error getting shorten custodial groups",
  );
  const shortenCustodialGroupsAPIResponse: ShortenCustodialGroupsAPIResponse =
    response.data;
  const shortenCustodialGroupsAPI: ShortenCustodialGroup[] =
    shortenCustodialGroupsAPIResponse.data;
  return { shortenCustodialGroups: shortenCustodialGroupsAPI };
};
