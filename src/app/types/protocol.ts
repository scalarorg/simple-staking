import { CustodianGroup } from "./custodians";

export interface Protocol {
  name: string;
  dest_chains: DestinationChain[];
  service_tag: string;
  btc_chain: BtcChain;
  custodian_group: CustodianGroup;
  is_custodian_only: boolean;
  status: ProtocolStatus;
}

export enum ProtocolStatus {
  StatusUnspecified = 0,
  Activated = 1,
  Deactivated = 2,
}

export interface DestinationChain {
  chain_name: string;
  chain_id: number;
  chain_type: string;
  chain_smart_contract_address: Uint8Array;
  token_contract_address: Uint8Array;
}

export interface BtcChain {
  btc_signer_endpoint: string;
  btc_signer_access_token: string;
  btc_signer_address: string;
  btc_signer_pk: Uint8Array;
  btc_network: string;
}
