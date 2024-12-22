import { ProtocolStatus } from "@/app/types/protocol";

export interface Custodian {
  Name: string;
  Status: ProtocolStatus;
  BtcPublicKey: Uint8Array;
  Description: string;
}

export interface CustodianGroup {
  Name: string;
  BtcNetwork: string;
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
