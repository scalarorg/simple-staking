import { DApp } from "../types/dApps";

import { apiWrapper } from "./apiWrapper";

export interface DApps {
  dApps: DApp[];
}

interface DAppsAPIResponse {
  data: DAppAPI[];
}

interface DAppAPI {
  ID: string;
  ChainName: string;
  BTCAddressHex: string;
  PublicKeyHex: string;
  State: boolean;
}

export const getDApps = async (): Promise<DApps> => {
  // const limit = 100;
  // const reverse = false;

  const response = await apiWrapper("GET", "/v1/dApp", "Error getting dApps");
  const dAppsAPIResponse: DAppsAPIResponse = response.data;
  const dAppsAPI: DAppAPI[] = dAppsAPIResponse.data;
  console.log("dAppsAPI", dAppsAPI);
  const dApps = dAppsAPI.map(
    (da: DAppAPI): DApp => ({
      id: da.ID,
      chainName: da.ChainName,
      btcAddress: da.BTCAddressHex,
      btcPk: da.PublicKeyHex,
      state: da.State,
    }),
  );

  return { dApps };
};
