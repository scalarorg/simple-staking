import {
  CreatePayload,
  DApp,
  DAppAPI,
  DApps,
  DAppsAPIResponse,
  IdPayload,
  UpdatePayload,
} from "../types/dApps";

import { apiWrapper } from "./apiWrapper";

export const getDApps = async (): Promise<DApps> => {
  // const limit = 100;
  // const reverse = false;

  const response = await apiWrapper("GET", "/v1/dApp", "Error getting dApps");
  const dAppsAPIResponse: DAppsAPIResponse = response.data;
  const dAppsAPI: DAppAPI[] = dAppsAPIResponse.data;
  const dApps = dAppsAPI.map(
    (da: DAppAPI): DApp => ({
      id: da.ID,
      chainName: da.ChainName,
      btcAddress: da.BTCAddressHex,
      btcPk: da.PublicKeyHex,
      state: da.State,
    }),
  );

  console.log({ dApps });

  return { dApps };
};

export const postDApp = async (
  chainName: string,
  btcAddressHex: string,
  publicKeyHex: string,
) => {
  const payload: CreatePayload = {
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
  };

  const response = await apiWrapper(
    "POST",
    "/v1/dApp",
    "Error submitting dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};

export const updateDApp = async (
  id: string,
  chainName: string,
  btcAddressHex: string,
  publicKeyHex: string,
) => {
  const payload: UpdatePayload = {
    id: id,
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
  };

  const response = await apiWrapper(
    "PUT",
    "/v1/dApp",
    "Error updating dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};

export const toggleDApp = async (id: string) => {
  const payload: IdPayload = {
    id,
  };

  const response = await apiWrapper(
    "PATCH",
    "/v1/dApp",
    "Error toggling dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};

export const deleteDApp = async (id: string) => {
  const payload: IdPayload = {
    id,
  };
  console.log(payload);

  const response = await apiWrapper(
    "DELETE",
    "/v1/dApp",
    "Error deleting dApp",
    payload,
  );

  // If the response status is 200, the request was accepted
  return response.status === 200;
};
