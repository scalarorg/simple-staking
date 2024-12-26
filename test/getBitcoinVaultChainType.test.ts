import { ChainType } from "@scalar-lab/bitcoin-vault";
import { describe, expect, it } from "bun:test";

import { getBitcoinVaultChainType } from "@/utils/tool";

describe("getBitcoinVaultChainType", () => {
  it("should return the correct chain type", () => {
    const chainTypeKeys = Object.keys(ChainType).filter((key) =>
      isNaN(Number(key)),
    );
    console.log("--- chainTypeKeys", chainTypeKeys);
    expect(getBitcoinVaultChainType("bitcoin", chainTypeKeys)).toBe("Bitcoin");
    expect(getBitcoinVaultChainType("evm", chainTypeKeys)).toBe("EVM");
    expect(getBitcoinVaultChainType("solana", chainTypeKeys)).toBe("Solana");
    expect(getBitcoinVaultChainType("cosmos", chainTypeKeys)).toBe("Cosmos");
  });
});
