export interface Custodial {
  ID: number;
  Name: string;
  BtcPublicKeyHex: string;
}

export interface CustodialGroup {
  ID: number;
  Name: string;
  BtcAddress: string;
  Quorum: number;
  Custodials: Custodial[];
}

export interface ShortenCustodialGroup {
  ID: number;
  Name: string;
  BtcAddress: string;
}

export interface ShortenCustodialGroupsAPIResponse {
  data: ShortenCustodialGroup[];
}

export interface CustodialGroupsAPIResponse {
  data: CustodialGroup[];
}
