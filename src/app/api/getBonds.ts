import { Pagination } from "../types/api";
import { Bond } from "../types/bonds";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedBonds {
  bonds: Bond[];
  pagination: Pagination;
}

interface BondsAPIResponse {
  data: BondAPI[];
  pagination: Pagination;
}

interface BondAPI {
  id: string;
  status: string;
  simplified_status: string;
  source_chain: string;
  destination_chain: string;
  destination_smart_contract_address: string;
  source_tx_hash: string;
  source_tx_hex: string;
  staker_pubkey: string;
  amount: string;
  created_at: number;
  updated_at: number;
}

export const getBonds = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<PaginatedBonds> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  const params = {
    stakerPubkey: publicKeyNoCoord,
  };

  const response = await apiWrapper(
    "POST",
    "/v1/vault/searchVault",
    "Error getting bonds",
    params,
  );

  const bondsAPIResponse: BondsAPIResponse = response.data;

  const bonds: Bond[] = bondsAPIResponse.data.map(
    (apiBond: BondAPI): Bond => ({
      id: apiBond.id,
      status: apiBond.status,
      simplifiedStatus: apiBond.simplified_status,
      sourceChain: apiBond.source_chain,
      destinationChain: apiBond.destination_chain,
      destinationSmartContractAddress:
        apiBond.destination_smart_contract_address,
      sourceTxHash: apiBond.source_tx_hash,
      sourceTxHex: apiBond.source_tx_hex,
      stakerPubkey: apiBond.staker_pubkey,
      amount: apiBond.amount,
      createdAt: apiBond.created_at,
      updatedAt: apiBond.updated_at,
    }),
  );

  return { bonds, pagination: bondsAPIResponse.pagination };
};
