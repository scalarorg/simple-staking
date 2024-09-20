import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import { Bond } from "../types/bonds";

export interface PaginatedBonds {
  bonds: Bond[];
  pagination: Pagination;
}

interface BondsAPIResponse {
  data: BondAPI[];
  pagination: Pagination;
}

interface BondAPI {
  staking_tx_hash_hex: string;
  staker_pk_hex: string;
  finality_provider_pk_hex: string;
  state: string;
  staking_value: number;
  staking_tx: StakingTxAPI;
  unbonding_tx?: UnbondingTxAPI;
  is_overflow: boolean;
}

interface StakingTxAPI {
  tx_hex: string;
  output_index: number;
  start_timestamp: string;
  start_height: number;
  timelock: number;
}

interface UnbondingTxAPI {
  tx_hex: string;
  output_index: number;
}

export const getBonds = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<PaginatedBonds> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  // const limit = 100;
  // const reverse = false;

  const params = {
    pagination_key: encode(key),
    // "pagination_reverse": reverse,
    // "pagination_limit": limit,
    staker_btc_pk: encode(publicKeyNoCoord),
  };

  //   const response = await apiWrapper(
  //     "GET",
  //     "/v1/staker/bonds",
  //     "Error getting bonds",
  //     params,
  //   );

  //   const bondsAPIResponse: BondsAPIResponse = response.data;

  //   const bonds: Bond[] = bondsAPIResponse.data.map(
  //     (apiBond: BondAPI): Bond => ({
  //       stakingTxHashHex: apiBond.staking_tx_hash_hex,
  //       stakerPkHex: apiBond.staker_pk_hex,
  //       finalityProviderPkHex: apiBond.finality_provider_pk_hex,
  //       state: apiBond.state,
  //       stakingValueSat: apiBond.staking_value,
  //       stakingTx: {
  //         txHex: apiBond.staking_tx.tx_hex,
  //         outputIndex: apiBond.staking_tx.output_index,
  //         startTimestamp: apiBond.staking_tx.start_timestamp,
  //         startHeight: apiBond.staking_tx.start_height,
  //         timelock: apiBond.staking_tx.timelock,
  //       },
  //       isOverflow: apiBond.is_overflow,
  //       unbondingTx: apiBond.unbonding_tx
  //         ? {
  //             txHex: apiBond.unbonding_tx.tx_hex,
  //             outputIndex: apiBond.unbonding_tx.output_index,
  //           }
  //         : undefined,
  //     }),
  //   );
  //   const bonds: Bond[] = [];

  const bonds: Bond[] = [
    {
      stakingTxHashHex:
        "ba506c3495e6ec653d93dc2f2b84726d766d37bc3143924cc6c013c31d9743be",
      stakerPkHex: "0x1234",
      finalityProviderPkHex: "0xfinalityProviderPkHex",
      state: "active",
      stakingValueSat: 10000,
      stakingTx: {
        txHex:
          "02000000000101cac899676ee5c3bc939407f907fc3642fa2bac5551e16184cee1fac17f33832f0000000000fdffffff04c832000000000000225120f16234a8c6518401784365648f0a454b7e0633c440a8fe8ad83190e09a01c12a0000000000000000476a450102030400207cd515ccaff46cede0abf521e99a40e63f7d96329d416a7b05227d43cb27a841be408151b895581cd0db852a88a3d071833837b60a2a02183e72a4182d3e3300000000000000003a6a380000000000aa36a74f818beff37bced3238098b595220010c0a3504f26f761c408986e49693dde7f7e95987b5f8241b800000000000032c841f94f0900000000160014b70ad91a8800b9d14b6c5f0549798f2a204222a0024730440220378ccdc6c3d1f4b1304fe840154379acb05396bb7c5dd2b9b288d1922441167f02202cf009303bd968be6e2800ea028603656a41dfe65ff5c0457680d254acaf5735012102207cd515ccaff46cede0abf521e99a40e63f7d96329d416a7b05227d43cb27a800000000",
        outputIndex: 0,
        startTimestamp: "",
        startHeight: 100,
        timelock: 100,
      },
      isOverflow: false,
      unbondingTx: undefined,
    },
  ];

  //   const pagination: Pagination = {
  //     next_key: bondsAPIResponse.pagination.next_key,
  //   };

  const pagination: Pagination = {
    next_key: "1",
  };

  return { bonds: bonds, pagination };
};
