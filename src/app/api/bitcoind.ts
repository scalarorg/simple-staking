import axios from "axios";

import { BtcUnspent, MempoolUTXO } from "@/app/types";

export const fromBtcUnspentToMempoolUTXO = (utxo: BtcUnspent): MempoolUTXO => {
  return {
    txid: utxo.txid,
    vout: utxo.vout,
    value: Math.floor(utxo.amount * 100000000), // convert to satoshis
    status: {
      confirmed: utxo.confirmations > 0,
      block_height: 0,
      block_hash: "",
      block_time: 0,
    },
  };
};

export const getBitcoindUTXOs = async (
  address: string,
  btcNetwork: string,
): Promise<MempoolUTXO[]> => {
  // ------------------------------
  const url = window.location.origin;

  const bitcoind_client_result = await axios.post(`${url}/api/bitcoind-api`, {
    method: "listunspent",
    params: [0, 9999999, [address]],
    btcNetwork: btcNetwork,
  });

  const listUnspent: BtcUnspent[] =
    bitcoind_client_result?.data?.data?.response;
  const utxos: MempoolUTXO[] = listUnspent.map(fromBtcUnspentToMempoolUTXO);

  return utxos;
};

export const getBitcoindBlocksHeight = async (
  btcNetwork: string,
): Promise<number> => {
  const url = window.location.origin;

  const bitcoind_client_result = await axios.post(`${url}/api/bitcoind-api`, {
    method: "getblockcount",
    params: [],
    btcNetwork: btcNetwork,
  });
  return bitcoind_client_result?.data?.data?.response;
};
