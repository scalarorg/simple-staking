import * as ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";

import { getBitcoindBlocksHeight, getBitcoindUTXOs } from "@/app/api/bitcoind";
import { getNetworkConfig } from "@/config/network.config";
import { ProjectENV } from "@/env";

import { getFundingUTXOs, getNetworkFees } from "../../mempool_api";
import {
  Fees,
  Network,
  UTXO,
  UnisatOptions,
  WalletProvider,
} from "../wallet_provider";

const ECPair = ECPairFactory(ecc);

export class RegtestWallet extends WalletProvider {
  private networkEnv: Network | undefined;
  private stakerAddress: string | undefined;
  private stakerPrivateKey: string | undefined;
  private stakerPublicKey: string | undefined;

  constructor() {
    super();
    this.networkEnv = getNetworkConfig().network;
    this.stakerAddress = ProjectENV.NEXT_PUBLIC_BOND_HOLDER_ADDRESS;
    this.stakerPrivateKey = ProjectENV.NEXT_PUBLIC_BOND_HOLDER_PRIVATE_KEY;
    this.stakerPublicKey = ProjectENV.NEXT_PUBLIC_BOND_HOLDER_PUBLIC_KEY;
  }
  //   --- Additional methods for RegtestWallet class ---
  //   --- Methods from WalletProvider class ---
  connectWallet = async (): Promise<this> => {
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Regtest Wallet";
  };

  getAddress = async (): Promise<string> => {
    return this.stakerAddress!;
  };

  getPrivateKeyWIF = async (): Promise<string> => {
    return this.stakerPrivateKey!;
  };

  getPublicKeyHex = async (): Promise<string> => {
    return this.stakerPublicKey!;
  };

  signPsbt = async (
    psbtHex: string,
    options?: UnisatOptions,
    privateKey?: string,
  ): Promise<string> => {
    const psbtBase64 = Buffer.from(psbtHex, "hex").toString("base64");
    const keyPair = ECPair.fromWIF(
      privateKey ? privateKey : this.stakerPrivateKey!,
      bitcoin.networks.regtest,
    );
    const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    return psbt.toHex();
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    return [""];
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    return "";
  };

  getNetwork = async (): Promise<Network> => {
    if (!this.networkEnv) {
      throw new Error("Network not set");
    }
    return this.networkEnv;
  };

  on = (eventName: string, callBack: () => void) => {
    return 0;
  };

  // Mempool calls

  getBalance = async (): Promise<number> => {
    // TODO: Change to get from bitcoind
    return 100000;
    // return await getAddressBalance(await this.getAddress());
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return "";
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // Call to bitcoind
    const nominatedUTXOs = await getBitcoindUTXOs(address);
    return await getFundingUTXOs(address, amount, nominatedUTXOs);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getBitcoindBlocksHeight();
  };
}
