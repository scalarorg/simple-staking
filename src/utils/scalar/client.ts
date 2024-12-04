import { getDApps } from "@/app/api/dApp";
import { DApp } from "@/app/types/dApps";

// TODO: Handle this information in scalar-chains
const custodialDAppMap: Record<string, boolean> = {
  "0xd1be2256087c54fe9858a8cc7f64058f0c7ac719": true, // Example custodial DApp
  "0x954690a705742Acc832d9A4244F58Fb1ba323949": false, // Example non-custodial DApp
};

export class ScalarClient {
  constructor(private readonly rpcEndpoint: string) {}

  async getDAppsFromScalar(): Promise<{ dApps: DApp[] }> {
    return getDApps();
  }

  isCustodialDApp(address: `0x${string}`): boolean {
    return custodialDAppMap[address] || false; // Returns false if the address is not found
  }
}
