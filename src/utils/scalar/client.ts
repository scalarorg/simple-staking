import {
  CustodianStatus,
  LiquidityModel,
  ProtocolStatus,
  Protocol as ScalarProtocol,
} from "@scalar-lab/scalarjs-sdk/dist/types";
import axios from "axios";

import { getShortenCustodianGroups } from "@/app/api/custodian";
import { getDApps } from "@/app/api/dApp";
import {
  Custodian,
  CustodianGroup,
  CustodianGroupsAPIResponse,
} from "@/app/types/custodians";
import { DApp } from "@/app/types/dApps";
import {
  DeleteDestinationChainRequest,
  DeleteProtocolRequest,
  GetAvailableChainByChainTypeResponse,
  GetAvailableCustodianGroupsByBtcNetworkNameResponse,
  Protocol,
  ProtocolChain,
  SetCustodianGroupRequest,
  UpdateBtcChainRequest,
  UpdateProtocolBasicsRequest,
  UpdateProtocolStatusRequest,
} from "@/app/types/protocol";
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
  constructor(private readonly grpcUrl: string) {}

  async getDAppsFromScalar(): Promise<{ dApps: DApp[] }> {
    return getDApps();
  }

  isCustodianDApp(address: `0x${string}`): boolean {
    return custodianDAppMap[address] || false; // Returns false if the address is not found
  }

  getBtcChainName(chain: ProtocolChain): string {
    if (chain.supported_chain.chain.startsWith("bitcoin")) {
      return "";
    }
    const [btcNetworkName, networkId] = chain.supported_chain.chain.split(
      "|",
    ) ?? ["", ""];
    let btcNetworkType = "testnet";
    if (networkId == "0") {
      btcNetworkType = "mainnet";
    }
    return `${btcNetworkName}-${btcNetworkType}${networkId ? `${networkId}` : ""}`;
  }

  async getProtocols(): Promise<{ protocols: Protocol[] }> {
    // Get from core
    const url = window.location.origin;
    const scalarProtocolsResponse = await axios.post(
      `${url}/api/get-protocols`,
      {
        grpcUrl: this.grpcUrl,
        status: ProtocolStatus.ACTIVATED,
      },
    );
    const { data } = scalarProtocolsResponse.data;
    console.log("Protocols from core:", data.protocols);
    const scalarProtocols = data.protocols;
    const protocols: Protocol[] = scalarProtocols.map(
      (scalarProtocol: ScalarProtocol) => {
        const custodianGroup: CustodianGroup | undefined =
          scalarProtocol.custodianGroup
            ? {
                UID: scalarProtocol.custodianGroup.uid,
                Name: scalarProtocol.custodianGroup.name,
                BtcPublicKey: scalarProtocol.custodianGroup.btcPubkey,
                Quorum: scalarProtocol.custodianGroup.quorum,
                Status: scalarProtocol.custodianGroup.status,
                Description: scalarProtocol.custodianGroup.description,
                Custodians: scalarProtocol.custodianGroup.custodians.map(
                  (custodian) => ({
                    Name: custodian.name,
                    Status: custodian.status,
                    BtcPublicKey: custodian.btcPubkey,
                    Description: custodian.description,
                  }),
                ),
              }
            : undefined;
        return {
          pubkey: scalarProtocol.pubkey,
          address: scalarProtocol.address,
          name: scalarProtocol.name,
          service_tag: scalarProtocol.tag,
          attribute: scalarProtocol.attribute
            ? scalarProtocol.attribute
            : {
                model: LiquidityModel.POOLING,
              },
          status: scalarProtocol.status,
          custodian_group: custodianGroup,
          chains: scalarProtocol.chains.map((chain) => {
            // const chain_name =
            //   chain.token.oneofKind === "erc20"
            //     ? chain.token.erc20.asset +
            //     "-" +
            //     chain.params?.chain.split("|")[1]
            //     : "BTC"; // TODO: Handle for BTC
            const chain_name = chain.chain;
            const parts = chain.chain.split("|");
            const chain_id = Number(parts[1]) || 0;
            const chain_type = parts[0] || "evm";
            const chain_smart_contract_address = chain.address
              ? new Uint8Array(
                  Buffer.from(hexStringWithout0x(chain.address), "hex"),
                )
              : new Uint8Array();
            return {
              chain_name: chain_name,
              chain_id: chain_id,
              chain_type: chain_type,
              chain_smart_contract_address: chain_smart_contract_address,
              supported_chain: chain,
            };
          }),
        };
      },
    );

    // // --- Get from old api
    // const { dApps }: { dApps: DApp[] } = await getDApps();
    // const oldProtocols: Protocol[] = dApps.map((dapp) => {
    //   const attribute = this.isCustodianDApp(hexStringWith0x(dapp.scAddress))
    //     ? {
    //         model: LiquidityModel.POOLING,
    //       }
    //     : {
    //         model: LiquidityModel.TRANSACTIONAL,
    //       };

    //   const custodianGroup: CustodianGroup = {
    //     UID: dapp.custodianGroup.ID.toString(),
    //     Name: dapp.custodianGroup.Name,
    //     BtcPublicKey: dapp.custodianGroup.TaprootAddress,
    //     Quorum: dapp.custodianGroup.Quorum,
    //     Status: CustodianStatus.ACTIVATED,
    //     Description: "",
    //     Custodians: dapp.custodianGroup.Custodians.map((custodian) => {
    //       return {
    //         Name: custodian.Name,
    //         Status: CustodianStatus.ACTIVATED,
    //         BtcPublicKey: new Uint8Array(
    //           Buffer.from(hexStringWithout0x(custodian.BtcPublicKeyHex), "hex"),
    //         ),
    //         Description: "",
    //       };
    //     }),
    //   };

    //   const chains: ProtocolChain[] = [
    //     {
    //       chain_name: dapp.chainName,
    //       chain_id: 0,
    //       chain_type: "EVM",
    //       chain_smart_contract_address: new Uint8Array(
    //         Buffer.from(hexStringWithout0x(dapp.tokenContractAddress), "hex"),
    //       ),
    //       supported_chain: {
    //         address: dapp.scAddress,
    //         token: {
    //           oneofKind: "erc20",
    //           erc20: {
    //             asset: dapp.chainName,
    //             chainId: new Uint8Array(),
    //             details: {
    //               tokenName: dapp.chainName,
    //               symbol: dapp.chainName,
    //               decimals: 18,
    //               capacity: new Uint8Array(),
    //             },
    //             tokenAddress: dapp.tokenContractAddress,
    //             txHash: "",
    //             status: 4,
    //             isExternal: false,
    //             burnerCode: new Uint8Array(),
    //           },
    //         },
    //       },
    //     },
    //   ];

    //   chains.push({
    //     chain_name: "BTC",
    //     chain_id: 0,
    //     chain_type: "BTC",
    //     chain_smart_contract_address: new Uint8Array(),
    //     supported_chain: {
    //       address: "",
    //       token: {
    //         oneofKind: "btc",
    //         btc: {},
    //       },
    //     },
    //   });

    //   return {
    //     pubkey: new Uint8Array(), // Scalar pubkey
    //     address: new Uint8Array(), // Scalar address
    //     name: dapp.chainName,
    //     service_tag: ProjectENV.NEXT_PUBLIC_SERVICE_TAG,
    //     attribute: attribute,
    //     status: ProtocolStatus.ACTIVATED,
    //     custodian_group: custodianGroup,
    //     chains: chains,
    //   };
    // });

    // // Merge protocols
    // protocols.push(...oldProtocols);
    return { protocols };
  }

  async getVersionAndTag(): Promise<{ version: number; tag: string } | null> {
    return {
      version: ProjectENV.NEXT_PUBLIC_VERSION,
      tag: ProjectENV.NEXT_PUBLIC_TAG,
    };
  }

  async getAvailableBtcNetworks(): Promise<string[]> {
    return ["bitcoin-testnet4", "bitcoin-mainnet"];
  }

  async getAvailableCustodianGroupsByBtcNetworkName(
    btcNetworkName: string,
  ): Promise<GetAvailableCustodianGroupsByBtcNetworkNameResponse> {
    const custodianGroups: Record<string, string[]> = {
      "bitcoin-mainnet": ["custodian-group-3", "custodian-group-4"],
    };
    if (btcNetworkName === "bitcoin-testnet4") {
      const shortenCustodianGroups = await getShortenCustodianGroups();
      return {
        custodian_groups_name:
          shortenCustodianGroups.shortenCustodianGroups.map(
            (custodianGroup) => custodianGroup.Name,
          ),
      };
    }
    return {
      custodian_groups_name: custodianGroups[btcNetworkName] || [],
    };
  }

  async getAvailableChainTypes(): Promise<string[]> {
    return ["evm", "solana", "cosmos"];
  }

  async getAvailableChainsByChainType(
    chainType: string,
  ): Promise<GetAvailableChainByChainTypeResponse> {
    const chains = {
      evm: [
        {
          chain_name: "ethereum-sepolia",
          chain_id: 11155111,
        },
      ],
      solana: [
        {
          chain_name: "solana-testnet",
          chain_id: 101,
        },
      ],
      cosmos: [
        {
          chain_name: "cosmos-testnet",
          chain_id: 101,
        },
      ],
    };
    return {
      chains: chains[chainType as keyof typeof chains],
    };
  }

  async deleteDestinationChain(
    request: DeleteDestinationChainRequest,
  ): Promise<void> {
    // TODO: Implement delete destination chain logic
    console.log("Deleting destination chain", request);
  }

  async setCustodianGroup(request: SetCustodianGroupRequest): Promise<void> {
    // TODO: Implement set custodian group logic
    console.log("Setting custodian group", request);
  }

  async updateBtcChain(request: UpdateBtcChainRequest): Promise<void> {
    // TODO: Implement update BTC chain logic
    console.log("Updating BTC chain", request);
  }

  async deleteProtocol(request: DeleteProtocolRequest): Promise<void> {
    // TODO: Implement delete protocol logic
    console.log("Deleting protocol", request);
  }

  async updateProtocolBasics(
    request: UpdateProtocolBasicsRequest,
  ): Promise<void> {
    // TODO: Implement update protocol basics logic
    console.log("Updating protocol basics", request);
  }

  async updateProtocolStatus(
    request: UpdateProtocolStatusRequest,
  ): Promise<void> {
    // TODO: Implement update protocol status logic
    console.log("Updating protocol status", request);
  }

  async getCustodianGroups(): Promise<CustodianGroupsAPIResponse> {
    const dapps = await getDApps();
    return {
      data: dapps.dApps.map((dapp) => ({
        UID: dapp.custodianGroup.ID.toString(),
        Name: dapp.custodianGroup.Name,
        BtcPublicKey: dapp.custodianGroup.TaprootAddress,
        Quorum: dapp.custodianGroup.Quorum,
        Status: CustodianStatus.ACTIVATED,
        Description: "",
        Custodians: dapp.custodianGroup.Custodians.map((custodian) => ({
          Name: custodian.Name,
          Status: CustodianStatus.ACTIVATED,
          BtcPublicKey: new Uint8Array(
            Buffer.from(hexStringWithout0x(custodian.BtcPublicKeyHex), "hex"),
          ),
          Description: "",
        })),
      })),
    };
  }

  async getCustodians(): Promise<{ data: Custodian[] }> {
    return {
      data: [
        {
          Name: "custodian-1",
          Status: CustodianStatus.ACTIVATED,
          BtcPublicKey: new Uint8Array(),
          Description: "",
        },
      ],
    };
  }
}
