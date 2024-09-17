import {
  CovenantParams,
  CovenantParamsAPI,
  CovenantParamsAPIResponse,
} from "../types";

import { apiWrapper } from "./apiWrapper";

export const getCovenantParams = async (): Promise<CovenantParams> => {
  const response = await apiWrapper(
    "GET",
    "/v1/params/covenant",
    "Error getting covenant params",
  );
  const covenantParamsAPIResponse: CovenantParamsAPIResponse = response.data;
  const covenantParamsAPI: CovenantParamsAPI = covenantParamsAPIResponse.data;
  const covenantParams = {
    covenantPubkeys: covenantParamsAPI.CovenantPubkeys,
    quorum: covenantParamsAPI.Quorum,
    tag: covenantParamsAPI.Tag,
    version: covenantParamsAPI.Version,
  };
  return covenantParams;
};
