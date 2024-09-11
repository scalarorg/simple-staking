import { CovenantParams } from "../types";

import { apiWrapper } from "./apiWrapper";

export const getCovenantParams = async (): Promise<CovenantParams> => {
  const response = await apiWrapper(
    "GET",
    "/v1/params/covenant",
    "Error getting covenant params",
  );
  const covenantParams: CovenantParams = response.data;
  return covenantParams;
};
