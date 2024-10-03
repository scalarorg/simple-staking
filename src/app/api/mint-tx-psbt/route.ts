import { NextResponse } from "next/server";

import { getClient } from "@/app/api/broadcast-btc-transaction/client";
import { parseENV } from "@/env";
import { getBTCNetworkFromAddress } from "@/utils/bitcoin";
import { convertToHexOfChainId } from "@/utils/blockchain";

import { getFeesRecommended } from "bitcoin-flow/utils/mempool";
import { getUTXOs, Staker, UTXO } from "vault/index";
import { fromBtcUnspentToMempoolUTXO } from "../bitcoind";

export async function POST(request: Request) {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  try {
    const {
      sourceChainAddress,
      sourceChainPublicKey,
      destinationChainId,
      smartContractAddress,
      tokenReceiverAddress,
      stakingAmount,
      mintingAmount,
      servicePublicKey,
      btcNetwork,
    } = await request.json();

    const ProjectENV = parseENV(btcNetwork);

    const quorum = Number(ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM!) || 0;
    const tag = ProjectENV.NEXT_PUBLIC_TAG!;
    const version = Number(ProjectENV.NEXT_PUBLIC_VERSION!) || 0;
    const covenantPublicKeys =
      ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS!.split(",");

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
      convertToHexOfChainId(destinationChainId),
      tokenReceiverAddressWithout0x,
      smartContractAddressWithout0x,
      mintingAmount,
    );

    const regularUTXOs: UTXO[] =
      getBTCNetworkFromAddress(sourceChainAddress) === "regtest"
        ? (
            await getClient(btcNetwork).command("listunspent", 0, 9999999, [
              sourceChainAddress,
            ])
          ).map(fromBtcUnspentToMempoolUTXO)
        : await getUTXOs(sourceChainAddress);

    let feeRate = (
      await getFeesRecommended(getBTCNetworkFromAddress(sourceChainAddress))
    ).fastestFee; // Get this from Mempool API

    const rbf = true; // Replace by fee, need to be true if we want to replace the transaction when the fee is low

    const result = await staker.getUnsignedVaultPsbt(
      regularUTXOs,
      stakingAmount,
      feeRate,
      rbf,
    );

    console.log("result", result);

    const { psbt: unsignedVaultPsbt, feeEstimate: fee } = result;

    const response = {
      status: 200,
      data: {
        unsignedVaultPsbtHex: unsignedVaultPsbt.toHex(),
      },
    };

    console.log("response", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in mint-tx-psbt", error);
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
