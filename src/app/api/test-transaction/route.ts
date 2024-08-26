import { NextResponse } from "next/server";

import { testMempoolAcceptance } from "bitcoin-flow/utils/node";

export async function POST(request: Request) {
  try {
    const { hexTxFromPsbt } = await request.json();

    if (!hexTxFromPsbt) {
      throw new Error("Please provide the hex tx from psbt");
    }

    const fullNodeUrl = process.env.BTC_FULL_NODE_URL;

    if (!fullNodeUrl) {
      throw new Error("Please provide the full node url");
    }

    const response = await testMempoolAcceptance(fullNodeUrl, hexTxFromPsbt);

    return NextResponse.json({ status: 200, data: response?.result?.[0] });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
