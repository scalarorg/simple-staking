import { CustodialGroup } from "./custodials";

export interface DApp {
  id: string;
  chainName: string;
  chainId: string;
  chainEndpoint: string;
  dappBtcSignerEndpoint: string;
  accessToken: string;
  btcAddress: string;
  btcPk: string;
  scAddress: string;
  tokenContractAddress: string;
  custodialGroup: CustodialGroup;
  state: boolean;
}

export interface DApps {
  dApps: DApp[];
}

export interface DAppUpdate extends DApp {
  custodialGroupName: string;
}

export interface CreatePayload {
  chain_name: string;
  btc_address_hex: string;
  public_key_hex: string;
  smart_contract_address: string;
  chain_id: string;
  chain_endpoint: string;
  rpc_url: string;
  access_token: string;
  token_contract_address: string;
  custodial_group_id: number;
}

export interface IdPayload {
  id: string;
}

export interface UpdatePayload extends CreatePayload {
  id: string;
}

export interface DAppAPI {
  ID: string;
  ChainName: string;
  BTCAddressHex: string;
  PublicKeyHex: string;
  SmartContractAddress: string;
  TokenContractAddress: string;
  State: boolean;
  ChainID: string;
  ChainEndpoint: string;
  RPCUrl: string;
  AccessToken: string;
  CustodialGroup: CustodialGroup;
}

export interface DAppsAPIResponse {
  data: DAppAPI[];
}
