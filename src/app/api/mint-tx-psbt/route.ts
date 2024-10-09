import { NextResponse } from "next/server";

import { fromBtcUnspentToMempoolUTXO } from "@/app/api/bitcoind";
import { getClient } from "@/app/api/broadcast-btc-transaction/client";
import { ProjectENV } from "@/env";
import { getBTCNetworkFromAddress } from "@/utils/bitcoin";
import { convertToHexOfChainId } from "@/utils/blockchain";

import { getFeesRecommended } from "bitcoin-flow/utils/mempool";
import { getUTXOs, Staker, UTXO } from "vault/index";

export async function POST(request: Request) {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  try {
    let warnings = [];

    const quorum = Number(ProjectENV.NEXT_PUBLIC_COVENANT_QUORUM!) || 0;
    const tag = ProjectENV.NEXT_PUBLIC_TAG!;
    const version = Number(ProjectENV.NEXT_PUBLIC_VERSION!) || 0;
    const covenantPublicKeys =
      ProjectENV.NEXT_PUBLIC_COVENANT_PUBKEYS!.split(",");

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
      convertToHexOfChainId(destinationChainId),
      tokenReceiverAddressWithout0x,
      smartContractAddressWithout0x,
      mintingAmount,
    );

    const regularUTXOs: UTXO[] =
      getBTCNetworkFromAddress(sourceChainAddress) === "regtest"
        ? (
            await getClient().command("listunspent", 0, 9999999, [
              sourceChainAddress,
            ])
          ).map(fromBtcUnspentToMempoolUTXO)
        : await getUTXOs(sourceChainAddress);

    let feeRate: number;
    try {
      feeRate = (
        await getFeesRecommended(getBTCNetworkFromAddress(sourceChainAddress))
      ).fastestFee; // Get this from Mempool API
    } catch (error) {
      console.warn("Error getting feeRate: ", error);
      console.warn("Setting fee rate equal to 1 !!!");
      warnings.push({
        errorType: "Error getting feeRate, setting at 1",
        error,
      });
      feeRate = 1;
    }

    // For testing purposes
    feeRate = 50;

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
      warnings,
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
