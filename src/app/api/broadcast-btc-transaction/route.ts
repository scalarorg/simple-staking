import { NextResponse } from "next/server";

import { getClient } from "./client";

export async function POST(request: Request) {
  try {
    const { hexTxFromPsbt, btcNetwork } = await request.json();

    if (!hexTxFromPsbt) {
      throw new Error("Please provide the hex tx from psbt");
    }
    let client = getClient(btcNetwork);
    const response = await client.command("sendrawtransaction", hexTxFromPsbt);

    return NextResponse.json({ status: 200, data: response });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
