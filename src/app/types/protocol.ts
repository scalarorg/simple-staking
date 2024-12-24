import { CustodianGroup } from "@/app/types/custodians";
import {
  ProtocolAttribute,
  ProtocolStatus,
  SupportedChain,
} from "scalarjs-sdk/dist/types";

export interface Protocol {
  pubkey: Uint8Array;
  address: Uint8Array;
  name: string;
  service_tag: string;
  attribute?: ProtocolAttribute;
  status: ProtocolStatus;
  custodian_group?: CustodianGroup;
  chains: ProtocolChain[];
}

export interface ProtocolChain {
  chain_name: string;
  chain_id: number;
  chain_type: string;
  chain_smart_contract_address: Uint8Array;
  supported_chain: SupportedChain;
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
