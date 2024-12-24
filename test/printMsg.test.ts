import { describe, expect, it } from "bun:test";
import { printMsg } from "scalarjs-sdk";

describe("test", () => {
  it("should work", () => {
    printMsg();
    expect(1).toBe(1);
  });
});
