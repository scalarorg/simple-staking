import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { chainName, grpcUrl } = await request.json();

    const gateway = "0x18B625B800AB4D641e68Ade0aa5Fb61a85Fe923B";

    const res = {
      status: 200,
      data: { gateway },
    };

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch gateway" },
      { status: 500 },
    );
  }
}
