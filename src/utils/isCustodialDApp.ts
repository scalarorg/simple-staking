// src/utils/isCustodialDApp.ts

// TODO: Implement this when we handle custodial DApps on xchains-core
// Define a record to map smart contract addresses to their custodial status
const custodialDAppMap: Record<string, boolean> = {
  "0xd1be2256087c54fe9858a8cc7f64058f0c7ac719": true, // Example custodial DApp
  "0x954690a705742Acc832d9A4244F58Fb1ba323949": false, // Example non-custodial DApp
};

// Method to return the custodial status of a given smart contract address
export function isCustodialDApp(address: `0x${string}`): boolean {
  return custodialDAppMap[address] || false; // Returns false if the address is not found
}
