import { CustodianGroup } from "./custodials";

export interface DApp {
  id: string;
  chainName: string;
  chainId: string;
  chainEndpoint: string;
  dappBtcSignerEndpoint: string;
  accessToken: string;
  btcAddress: string;
  btcNetwork: string;
  btcPk: string;
  scAddress: string;
  tokenContractAddress: string;
  custodianGroup: CustodianGroup;
  state: boolean;
}

export interface DApps {
  dApps: DApp[];
}

export interface DAppUpdate extends DApp {
  custodianGroupName: string;
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
  custodian_group_id: number;
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
  BTCNetwork: string;
  PublicKeyHex: string;
  SmartContractAddress: string;
  TokenContractAddress: string;
  State: boolean;
  ChainID: string;
  ChainEndpoint: string;
  RPCUrl: string;
  AccessToken: string;
  CustodianGroup: CustodianGroup;
}

export interface DAppsAPIResponse {
  data: DAppAPI[];
}
