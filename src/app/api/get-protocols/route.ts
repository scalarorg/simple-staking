import { NextResponse } from "next/server";
import { getProtocols, Protocol } from "@scalar-lab/scalarjs-sdk";

export async function POST(request: Request) {
  try {
    const { grpcUrl, status } = await request.json();
    const protocols: Protocol[] = await getProtocols({
      grpcUrl: "localhost:9090",
      // status,
    });

    const res = {
      status: 200,
      data: { protocols },
    };

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error fetching protocols:", error);
    return NextResponse.json(
      { error: "Failed to fetch protocols" },
      { status: 500 },
    );
  }
}
