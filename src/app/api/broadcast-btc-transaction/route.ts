import { NextResponse } from "next/server";

import { sendToBitcoinNetwork } from "bitcoin-flow/utils/node";

export async function POST(request: Request) {
  try {
    const { hexTxFromPsbt } = await request.json();

    if (!hexTxFromPsbt) {
      throw new Error("Please provide the hex tx from psbt");
    }

    const fullNodeUrl = process.env.BTC_NODE_URL;

    if (!fullNodeUrl) {
      throw new Error("Please provide the full node url");
    }

    const response = await sendToBitcoinNetwork(fullNodeUrl, hexTxFromPsbt);

    return NextResponse.json({ status: 200, data: response?.result });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
