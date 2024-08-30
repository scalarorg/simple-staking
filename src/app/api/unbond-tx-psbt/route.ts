import { NextResponse } from "next/server";

import { getBTCNetworkFromAddress } from "@/utils/bitcoin";

import { getFeesRecommended } from "bitcoin-flow/utils/mempool";
import { UnStaker } from "vault/index";

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_QUORUM) {
      throw new Error("Quorum is not set");
    }

    const quorum = Number(process.env.NEXT_PUBLIC_QUORUM) || 0;

    if (!process.env.NEXT_PUBLIC_COVENANT_PUBKEYS) {
      throw new Error("Covenant public keys are not set");
    }

    const covenantPublicKeys =
      process.env.NEXT_PUBLIC_COVENANT_PUBKEYS.split(",");

    const { btcStakerAddress, btcReceiverAddress, vaultTxHex } =
      await request.json();

    const unStaker = new UnStaker(
      btcStakerAddress,
      vaultTxHex,
      covenantPublicKeys,
      quorum,
    );

    let feeRate = (
      await getFeesRecommended(getBTCNetworkFromAddress(btcStakerAddress))
    ).fastestFee; // Get this from Mempool API
    const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low
    const {
      psbt: unsignedPsbt,
      // feeEstimate: fee,
      // burningLeaf,
    } = await unStaker.getUnsignedBurningPsbt(btcReceiverAddress, feeRate, rbf);

    return NextResponse.json({
      status: 200,
      data: {
        unsignedUnbondPsbtHex: unsignedPsbt.toHex(),
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
