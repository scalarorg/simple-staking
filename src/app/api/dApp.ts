import { ProjectENV } from "@/env";

import {
  CreatePayload,
  DApp,
  DAppAPI,
  DAppsAPIResponse,
  IdPayload,
  UpdatePayload,
} from "../types/dApps";
import { getConfig } from "../wagmi";

import { apiWrapper } from "./apiWrapper";

// TODO: remove this after xchains-api is done implemeting the chainId and chainEndpoint
const config = getConfig();
const chains = config.chains;

export const getDApps = async (): Promise<{ dApps: DApp[] }> => {
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
    return {
      id: da.ID,
      chainId: da.ChainID ? da.ChainID : lookUpChainId,
      chainEndpoint: da.ChainEndpoint ? da.ChainEndpoint : lookUpChainEndpoint,
      dappBtcSignerEndpoint: da.RPCUrl,
      accessToken: da.AccessToken,
      tokenContractAddress: da.TokenContractAddress,
      chainName: da.ChainName,
      btcAddress: da.BTCAddressHex,
      btcPk: da.PublicKeyHex,
      scAddress: da.SmartContractAddress,
      custodialGroup: {
        ID: 0,
        Name: "All",
        BtcAddress: ProjectENV.NEXT_PUBLIC_GROUP_ALL_BTC_ADDRESS,
        Quorum: ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM,
        Custodials: ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS!.map(
          (pubkey: string, index: number) => ({
            ID: index,
            Name: "Custodial" + (index + 1),
            BtcPublicKeyHex: pubkey,
          }),
        ),
      },
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
  tokenContractAddress: string,
  // custodialGroupName: string,
) => {
  // TODO: Update this after xchains-api done
  const payload: CreatePayload = {
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
    smart_contract_address: smartContractAddress,
    chain_id: chainId,
    chain_endpoint: chainEndpoint,
    rpc_url: dappBtcSignerEndpoint,
    access_token: accessToken,
    token_contract_address: tokenContractAddress,
    // custodial_group_name: custodialGroupName,
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
  tokenContractAddress: string,
  custodialGroupName: string,
) => {
  const payload: UpdatePayload = {
    id: id,
    chain_name: chainName,
    btc_address_hex: btcAddressHex,
    public_key_hex: publicKeyHex,
    smart_contract_address: smartContractAddress,
    chain_id: chainId,
    chain_endpoint: chainEndpoint,
    rpc_url: dappBtcSignerEndpoint,
    access_token: accessToken,
    token_contract_address: tokenContractAddress,
    // custodial_group_name: custodialGroupName,
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
