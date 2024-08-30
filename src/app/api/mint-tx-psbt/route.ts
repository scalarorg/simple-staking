import { NextResponse } from "next/server";

import { getBTCNetworkFromAddress } from "@/utils/bitcoin";

import { getFeesRecommended } from "bitcoin-flow/utils/mempool";
import { getUTXOs, Staker, UTXO } from "vault/index";

export async function POST(request: Request) {
  try {
    const quorum = Number(process.env.NEXT_PUBLIC_QUORUM!) || 0;
    const tag = process.env.NEXT_PUBLIC_TAG!;
    const version = Number(process.env.NEXT_PUBLIC_VERSION!) || 0;
    const covenantPublicKeys =
      process.env.NEXT_PUBLIC_COVENANT_PUBKEYS!.split(",");

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

    const staker = new Staker(
      sourceChainAddress,
      sourceChainPublicKey,
      servicePublicKey,
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

    let feeRate = (
      await getFeesRecommended(getBTCNetworkFromAddress(sourceChainAddress))
    ).fastestFee; // Get this from Mempool API
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
