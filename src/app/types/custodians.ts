import { CustodianStatus } from "scalarjs-sdk/dist/types";

export interface Custodian {
  Name: string;
  Status: CustodianStatus;
  BtcPublicKey: Uint8Array;
  Description: string;
}

export interface CustodianGroup {
  UID: string;
  Name: string;
  BtcPublicKey: string;
  Quorum: number;
  Status: CustodianStatus;
  Description: string;
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
