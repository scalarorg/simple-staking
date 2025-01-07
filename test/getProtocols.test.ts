import { describe, expect, it } from "bun:test";
import { getProtocols, Protocol } from "@scalar-lab/scalarjs-sdk";

describe("getProtocols", () => {
  it("should be able to get the protocols", async () => {
    // variable
    const grpcUrl = "18.141.172.185:9090";

    try {
      const protocols: Protocol[] = await getProtocols({
        grpcUrl: process.env.SCALAR_GRPC_URL || "localhost:9090",
      });

      console.log("--- protocols", protocols);

      // Log the response and protocols
      console.log("Full Response:", JSON.stringify(protocols, null, 2));

      // Add proper assertions
      expect(protocols).toBeInstanceOf(Array);

      // Verify each protocol has the required properties
      protocols.forEach((protocol) => {
        expect(protocol).toMatchObject({
          pubkey: expect.any(Uint8Array),
          address: expect.any(Uint8Array),
          name: expect.any(String),
          tag: expect.any(String),
          attribute: expect.any(Object),
          custodianGroup: expect.any(Object),
          chains: expect.any(Array),
          status: expect.any(Object),
        });
      });
    } catch (error) {
      // Fail the test if there's an error
      throw error;
    }
  });
});
