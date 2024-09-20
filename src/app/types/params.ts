export interface CovenantParams {
  covenantPubkeys: string[];
  quorum: number;
  tag: string;
  version: number;
}

export interface CovenantParamsAPIResponse {
  data: CovenantParamsAPI;
}

export interface CovenantParamsAPI {
  CovenantPubkeys: string[];
  Quorum: number;
  Tag: string;
  Version: number;
}
