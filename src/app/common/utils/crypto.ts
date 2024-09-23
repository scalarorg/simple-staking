import * as ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";

export const ECPair = ECPairFactory(ecc);

export const generatePrivateKey = function (network?: bitcoin.Network): string {
  const keyPair = ECPair.makeRandom({ network });
  return keyPair.toWIF();
};
export const extractPublicKeyFromWIF = function (
  WIF: string,
  network?: bitcoin.Network,
): string {
  const keyPair = ECPair.fromWIF(WIF, network);
  return keyPair.publicKey.toString("hex");
};

const crypto = {
  ECPair,
  generatePrivateKey,
  extractPublicKeyFromWIF,
};
export default crypto;
