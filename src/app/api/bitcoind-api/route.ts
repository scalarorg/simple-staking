import { NextResponse } from "next/server";

import { getClient } from "@/app/api/broadcast-btc-transaction/client";

export async function POST(request: Request) {
  try {
    const { method: method, params: params } = await request.json();
    const client = getClient();
    const response = await client.command(method, ...params);

    return NextResponse.json({
      status: 200,
      data: { response: response },
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      // @ts-ignore
      error: error?.message || JSON.stringify(error),
    });
  }
}
