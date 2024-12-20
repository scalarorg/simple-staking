import { CustodianGroup } from "./custodians";

export interface Protocol {
  name: string;
  pubkey: Uint8Array;
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
  token: ERC20TokenMetadata;
}

export interface ERC20TokenMetadata {
  asset: string;
  chain_id: Uint8Array;
  details: TokenDetails;
  token_address: string;
  tx_hash: string;
  status: TokenStatus;
  is_external: boolean;
  burner_code: Uint8Array;
}

export interface TokenDetails {
  token_name: string;
  symbol: string;
  decimals: number;
  capacity: Uint8Array;
}

export enum TokenStatus {
  STATUS_UNSPECIFIED = 0,
  STATUS_INITIALIZED = 1,
  STATUS_PENDING = 2,
  STATUS_CONFIRMED = 4,
}

export interface BtcChain {
  btc_signer_endpoint: string;
  btc_signer_access_token: string;
  btc_signer_address: string;
  btc_signer_pk: Uint8Array;
  btc_network: string;
}

export interface CreateProtocolRequest {
  name: string;
  pubkey: Uint8Array;
  service_tag: string;

  btc_signer_endpoint: string;
  btc_signer_access_token: string;
  btc_signer_address: string;
  btc_signer_pk: Uint8Array;
  btc_network: string;

  custodian_group_name: string;
  is_custodian_only: boolean;
  status: ProtocolStatus;
}

export interface DeleteProtocolRequest {
  name: string;
}

export interface GetAvailableCustodianGroupsByBtcNetworkNameResponse {
  custodian_groups_name: string[];
}

export interface AddDestinationChainRequest {
  protocol_name: string;

  // Chain details
  chain_name: string;
  chain_id: number;
  chain_type: string;
  chain_smart_contract_address: Uint8Array;

  // Token details
  token: ERC20TokenMetadata;
}

export interface SetCustodianGroupRequest {
  protocol_name: string;
  btc_network: string;
  custodian_group_name: string;
}

export interface UpdateBtcChainRequest {
  protocol_name: string;
  btc_signer_endpoint: string;
  btc_signer_access_token: string;
  btc_signer_address: string;
  btc_signer_pk: Uint8Array;
}

export interface DeleteDestinationChainRequest {
  protocol_name: string;
  chain_id: number;
  chain_type: string;
  chain_smart_contract_address: Uint8Array;
}

export interface GetAvailableChainByChainTypeResponse {
  chains: {
    chain_name: string;
    chain_id: number;
  }[];
}

export interface UpdateProtocolBasicsRequest {
  protocol_name: string;
  service_tag: string;
}

export interface UpdateProtocolStatusRequest {
  protocol_name: string;
  status: ProtocolStatus;
}
