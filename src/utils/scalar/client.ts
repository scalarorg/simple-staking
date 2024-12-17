import { getDApps } from "@/app/api/dApp";
import { DApp } from "@/app/types/dApps";
import { Protocol, ProtocolStatus } from "@/app/types/protocol";
import { ProjectENV } from "@/env";
import { hexStringWithout0x } from "@/utils/trim";

// TODO: Handle this information in scalar-chains
const custodianDAppMap: Record<string, boolean> = {
  "0xd1be2256087c54fe9858a8cc7f64058f0c7ac719": true, // Example custodian DApp
  "0x954690a705742Acc832d9A4244F58Fb1ba323949": false, // Example non-custodian DApp
};

const destinationChainTokenNameMap: Record<string, string> = {
  "0xd1be2256087c54fe9858a8cc7f64058f0c7ac719": "pBTC",
  "0x954690a705742Acc832d9A4244F58Fb1ba323949": "sBTC",
};

export class ScalarClient {
  constructor(private readonly rpcEndpoint: string) {}

  async getDAppsFromScalar(): Promise<{ dApps: DApp[] }> {
    return getDApps();
  }

  isCustodianDApp(address: `0x${string}`): boolean {
    return custodianDAppMap[address] || false; // Returns false if the address is not found
  }

  async getProtocols(): Promise<{ protocols: Protocol[] }> {
    const dapps = await getDApps();
    const protocols = dapps.dApps.map((dapp) => {
      // Convert hex strings to Uint8Array by removing '0x' prefix and converting to bytes
      const contractAddressBytes = new Uint8Array(
        Buffer.from(hexStringWithout0x(dapp.scAddress), "hex"),
      );
      const tokenAddressBytes = new Uint8Array(
        Buffer.from(hexStringWithout0x(dapp.tokenContractAddress), "hex"),
      );
      const btcSignerPk = new Uint8Array(
        Buffer.from(hexStringWithout0x(dapp.btcPk), "hex"),
      );

      return {
        name: dapp.chainName,
        scalar_pk: new Uint8Array(),
        dest_chains: [
          {
            chain_name: dapp.chainName,
            chain_id: Number(dapp.chainId),
            chain_type: "EVM",
            chain_smart_contract_address: contractAddressBytes,
            token_name: destinationChainTokenNameMap[dapp.scAddress],
            token_contract_address: tokenAddressBytes,
          },
        ],
        service_tag: ProjectENV.NEXT_PUBLIC_SERVICE_TAG,
        btc_chain: {
          btc_signer_endpoint: dapp.dappBtcSignerEndpoint,
          btc_signer_access_token: dapp.accessToken,
          btc_signer_address: dapp.btcAddress,
          btc_signer_pk: btcSignerPk,
          btc_network: dapp.btcNetwork || "bitcoin-testnet4",
        },
        custodian_group: {
          Name: dapp.custodianGroup.Name,
          TaprootAddress: dapp.custodianGroup.TaprootAddress,
          Quorum: dapp.custodianGroup.Quorum,
          BtcNetwork: "bitcoin-testnet4",
          Custodians: dapp.custodianGroup.Custodians.map((custodian) => ({
            Name: custodian.Name,
            Status: ProtocolStatus.Activated,
            BtcPublicKey: new Uint8Array(
              Buffer.from(hexStringWithout0x(custodian.BtcPublicKeyHex), "hex"),
            ),
            Description: "",
          })),
        },
        is_custodian_only: this.isCustodianDApp(
          dapp.scAddress as `0x${string}`,
        ),
        status: ProtocolStatus.Activated,
      };
    });
    return { protocols };
  }

  async getVersionAndTag(): Promise<{ version: number; tag: string } | null> {
    return {
      version: ProjectENV.NEXT_PUBLIC_VERSION,
      tag: ProjectENV.NEXT_PUBLIC_TAG,
    };
  }
}
