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
  state: boolean;
}

export interface DApps {
  dApps: DApp[];
}

export interface CreatePayload {
  chain_name: string;
  btc_address_hex: string;
  public_key_hex: string;
  smart_contract_address: string;
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
  State: boolean;
}

export interface DAppsAPIResponse {
  data: DAppAPI[];
}
