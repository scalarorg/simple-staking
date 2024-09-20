export type BtcUnspent = {
  txid: string;
  vout: number;
  address: string;
  label?: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
  desc: string;
  parent_descs?: string[];
  safe: boolean;
};

export interface MempoolUTXO {
  txid: string;
  vout: number;
  status?: status;
  value: number;
}

export interface status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}
