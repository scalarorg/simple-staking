import { VaultUtils, bytesToHex, hexToBytes } from "@scalar-lab/bitcoin-vault";
import { address, networks } from "bitcoinjs-lib";
import { describe, expect, it } from "bun:test";

import { getTaprootAddressFromLockingScript } from "@/utils/bitcoin";

describe("bech32m", () => {
  it("should be able to get the taproot address from a locking script", () => {
    const vault = VaultUtils.getInstance("SCALAR", "pools", 0, "testnet4");
    const cutodianPubkeys = [
      "0215da913b3e87b4932b1e1b87d9667c28e7250aa0ed60b3a31095f541e1641488",
      "02f0f3d9beaf7a3945bcaa147e041ae1d5ca029bde7e40d8251f0783d6ecbe8fb5",
      "03594e78c0a2968210d9c1550d4ad31b03d5e4b9659cf2f67842483bb3c2bb7811",
      "03b59e575cef873ea95273afd55956c84590507200d410e693e4b079a426cc6102",
      "03e2d226cfdaec93903c3f3b81a01a81b19137627cb26e621a0afb7bcd6efbcfff",
    ];
    const custodianPubkeysUint8Array = cutodianPubkeys.map((pubkey) =>
      hexToBytes(pubkey.replace("0x", "")),
    );

    const numberOfCustodianPubkeys = custodianPubkeysUint8Array.length;
    const custodian_pubkeys_uint8array = new Uint8Array(
      33 * numberOfCustodianPubkeys,
    );

    for (let i = 0; i < numberOfCustodianPubkeys; i++) {
      custodian_pubkeys_uint8array.set(custodianPubkeysUint8Array[i], i * 33);
    }

    const onlyCovenantsLockingScript = vault.onlyCovenantsLockingScript({
      covenantPubkeys: custodian_pubkeys_uint8array,
      covenantQuorum: 3,
    });
    const onlyCovenantsLockingScriptString = bytesToHex(
      onlyCovenantsLockingScript,
    );
    console.log(
      "--- onlyCovenantsLockingScriptString",
      onlyCovenantsLockingScriptString,
    );
    const taprootAddress = getTaprootAddressFromLockingScript(
      onlyCovenantsLockingScript,
      networks.testnet,
    );
    console.log("--- taprootAddress", taprootAddress);
    expect(taprootAddress).toEqual(
      "tb1p07q440mdl4uyywns325dk8pvjphwety3psp4zvkngtjf3z3hhr2sfar3hv",
    );
  });
});

describe("bitcoinjs-lib", () => {
  it("should be able to get the address from a locking script and network", () => {
    const vault = VaultUtils.getInstance("SCALAR", "pools", 0, "testnet4");
    const cutodianPubkeys = [
      "0215da913b3e87b4932b1e1b87d9667c28e7250aa0ed60b3a31095f541e1641488",
      "02f0f3d9beaf7a3945bcaa147e041ae1d5ca029bde7e40d8251f0783d6ecbe8fb5",
      "03594e78c0a2968210d9c1550d4ad31b03d5e4b9659cf2f67842483bb3c2bb7811",
      "03b59e575cef873ea95273afd55956c84590507200d410e693e4b079a426cc6102",
      "03e2d226cfdaec93903c3f3b81a01a81b19137627cb26e621a0afb7bcd6efbcfff",
    ];
    const custodianPubkeysUint8Array = cutodianPubkeys.map((pubkey) =>
      hexToBytes(pubkey.replace("0x", "")),
    );

    const numberOfCustodianPubkeys = custodianPubkeysUint8Array.length;
    const custodian_pubkeys_uint8array = new Uint8Array(
      33 * numberOfCustodianPubkeys,
    );

    for (let i = 0; i < numberOfCustodianPubkeys; i++) {
      custodian_pubkeys_uint8array.set(custodianPubkeysUint8Array[i], i * 33);
    }

    const onlyCovenantsLockingScript = Buffer.from(
      vault.onlyCovenantsLockingScript({
        covenantPubkeys: custodian_pubkeys_uint8array,
        covenantQuorum: 3,
      }),
    );
    const taprootAddress = address.fromOutputScript(
      onlyCovenantsLockingScript,
      networks.testnet,
    );
    console.log("--- taprootAddress", taprootAddress);
    expect(taprootAddress).toEqual(
      "tb1p07q440mdl4uyywns325dk8pvjphwety3psp4zvkngtjf3z3hhr2sfar3hv",
    );
  });
});
