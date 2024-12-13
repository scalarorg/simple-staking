export interface Custodian {
  ID: number;
  Name: string;
  BtcPublicKeyHex: string;
}

export interface CustodianGroup {
  ID: number;
  Name: string;
  TaprootAddress: string;
  Quorum: number;
  Custodians: Custodian[];
}

export interface ShortenCustodianGroup {
  ID: number;
  Name: string;
  TaprootAddress: string;
}

export interface ShortenCustodianGroupsAPIResponse {
  data: ShortenCustodianGroup[];
}

export interface CustodianGroupsAPIResponse {
  data: CustodianGroup[];
}
