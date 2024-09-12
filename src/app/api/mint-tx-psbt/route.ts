import { useFees } from "@mempool/mempool.js/lib/app/bitcoin/fees";
import { NextResponse } from "next/server";

import { ProjectENV } from "@/env";

import { getUTXOs, Staker, UTXO } from "vault/index";
import { getCovenantParams } from "../getParams";

import { mempoolAxios } from "./client";


export async function POST(request: Request) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const feesService = useFees(mempoolAxios);
  try {
    const covenantParams = await getCovenantParams();
    const covenantPublicKeys = covenantParams.covenantPubkeys;
    const quorum = covenantParams.quorum;
    const tag = covenantParams.tag;
    const version = covenantParams.version;

    const {
      sourceChainAddress,
      sourceChainPublicKey,
      destinationChainId,
      smartContractAddress,
      tokenReceiverAddress,
      stakingAmount,
      mintingAmount,
      servicePublicKey,
    } = await request.json();

    // Remove 0x prefix
    const smartContractAddressWithout0x = smartContractAddress.slice(2);
    const tokenReceiverAddressWithout0x = tokenReceiverAddress.slice(2);
    const servicePublicKeyWithout0x = servicePublicKey.slice(2);

    const staker = new Staker(
      sourceChainAddress,
      sourceChainPublicKey,
      servicePublicKeyWithout0x,
      covenantPublicKeys,
      quorum,
      tag,
      version,
      Number(destinationChainId).toString(16), // Convert to hex
      tokenReceiverAddressWithout0x,
      smartContractAddressWithout0x,
      mintingAmount,
    );

    const regularUTXOs: UTXO[] = await getUTXOs(sourceChainAddress);

    // TODO: FIX BUG AT GETTING FEE RATE
    // let { fastestFee: feeRate } = await feesService.getFeesRecommended(); // Get this from Mempool API
    const feeRate = parseInt(ProjectENV.NEXT_PUBLIC_BTC_NODE_FEE_RATE) || 100;

    const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low
    const { psbt: unsignedVaultPsbt, feeEstimate: fee } =
      await staker.getUnsignedVaultPsbt(
        regularUTXOs,
        stakingAmount,
        feeRate,
        rbf,
      );

    return NextResponse.json({
      status: 200,
      data: {
        unsignedVaultPsbtHex: unsignedVaultPsbt.toHex(),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
