import {
  CreatePayload,
  DApp,
  DAppAPI,
  DApps,
  DAppsAPIResponse,
  IdPayload,
  UpdatePayload,
} from "../types/dApps";
import { getConfig } from "../wagmi";

import { apiWrapper } from "./apiWrapper";

// TODO: remove this after xchains-api is done implemeting the chainId and chainEndpoint
const config = getConfig();
const chains = config.chains;

export const getDApps = async (): Promise<DApps> => {
  // const limit = 100;
  // const reverse = false;

  const response = await apiWrapper("GET", "/v1/dApp", "Error getting dApps");
  const dAppsAPIResponse: DAppsAPIResponse = response.data;
  const dAppsAPI: DAppAPI[] = dAppsAPIResponse.data;
  // TODO: remove this after xchains-api is done implemeting the chainId and chainEndpoint
  const dApps = dAppsAPI.map((da: DAppAPI): DApp => {
    // TODO: get these data from xchains-api later
    const lookUpChains = chains.find((chain) => chain.name === da.ChainName);
    let [lookUpChainId, lookUpChainEndpoint] = ["", ""];
    if (lookUpChains) {
      lookUpChainId = lookUpChains.id.toString();
      lookUpChainEndpoint = lookUpChains.rpcUrls.default.http[0];
    }
    const dappBtcSignerEndpoint = "localhost:12345";
    const accessToken = "temp";
    return {
      id: da.ID,
      chainId: lookUpChainId,
      chainEndpoint: lookUpChainEndpoint,
      dappBtcSignerEndpoint: dappBtcSignerEndpoint,
      accessToken: accessToken,
      chainName: da.ChainName,
      btcAddress: da.BTCAddressHex,
      btcPk: da.PublicKeyHex,
      scAddress: da.SmartContractAddress,
      state: da.State,
    };
  });
  return { dApps };
};

export const postDApp = async (
  chainName: string,
  chainId: string,
  chainEndpoint: string,
  dappBtcSignerEndpoint: string,
  accessToken: string,
  btcAddressHex: string,
  publicKeyHex: string,
  smartContractAddress: string,
) => {
  // TODO: Update this after xchains-api done
  const payload: CreatePayload = {
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
    smart_contract_address: smartContractAddress,
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
  chainId: string,
  chainEndpoint: string,
  dappBtcSignerEndpoint: string,
  accessToken: string,
  btcAddressHex: string,
  publicKeyHex: string,
  smartContractAddress: string,
) => {
  const payload: UpdatePayload = {
    id: id,
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
    smart_contract_address: smartContractAddress,
  };
  // TODO: Update this after xchains-api done
  const response = await apiWrapper(
    "PUT",
    "/v1/dApp",
    "Error updating dApp request",
    payload,
  );

  // If the response status is 202, the request was accepted
  return response.status === 200;
};

export const deleteDApp = async (id: string) => {
  const payload: IdPayload = {
    id: id,
  };

  const response = await apiWrapper(
    "DELETE",
    "/v1/dApp",
    "Error deleting dApp",
    payload,
  );

  // If the response status is 200, the request was accepted
  return response.status === 200;
};

export const toggleDApp = async (id: string) => {
  const payload: IdPayload = {
    id: id,
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
