import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const VaultModuleComponent = ({
  tag,
  version,
}: {
  tag: string;
  version: number;
}) => {
  return (
    <div>
      Wasm module loaded: {tag} - Version: {version}
    </div>
  );
};
// Hook to initialize the WASM module and manage its loading state
const useVaultModule = () => {
  const [loading, setLoading] = useState(true);
  const [vault, setVault] = useState<any>(null); // State to hold the vault instance
  useEffect(() => {
    const loadWasmModule = async () => {
      try {
        // Import the WASM module and fetch the binary
        const wasmModule = await import("@scalar-lab/bitcoin-wasm");
        // const wasmBinary = await import(
        //   "@scalar-lab/bitcoin-wasm/dist/bitcoin-vault-web_bg.wasm"
        // );
        const wasmBinary = await fetch("/wasm/bitcoin-vault-web_bg.wasm").then(
          (response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.arrayBuffer();
          },
        );
        // Initialize the WASM module
        wasmModule.initSync({ module: wasmBinary });
        // Import your VaultWasm wrapper and initialize with your args
        const vaultModule = await import("@scalar-lab/bitcoin-vault");
        const vaultInstance = vaultModule.createVaultWasm("01020304", 1);
        setVault(vaultInstance); // Set the vault instance in state

        console.log({ wasmModule, vaultModule, vaultInstance });

        console.log("pubkey size", vaultModule.BTC_PUBKEY_SIZE);

        const stakingAmount = BigInt(900);
        const stakerPubkey = Buffer.from(
          "022ae31ea8709aeda8194ba3e2f7e7e95e680e8b65135c8983c0a298d17bc5350a",
          "hex",
        );
        const protocolPubkey = Buffer.from(
          "02992b50ef84354a4c0b5831bc90b36b5da98f7fc8969df5f4c88f5ec270b0dfbb",
          "hex",
        );
        const custodialPubkeys = Buffer.concat(
          "021c3fd34125c55b33a23ff57e050fca9dde3788a66d88d1b1998c70324866c86f,03ab37c7e332ec8d60cadba9cd920e211f9c5cdc81ced03ecb52fea1e4e90ea85d,03e7278bac7bea92ddf1b9a8b70e7aaa1fccf073f5c7d4ec00831ea2be2c9a79d4,0350bbe254328839d90d4a3a0ab870b8807afc206cb9b76d3ec7947ed653649565,03667cf8a23ff010d1a8ed844833796fe04d6d4717b77584d787a307e49d6ed5d6"
            .split(",")
            .map((pubkey) => Buffer.from(pubkey, "hex")),
        );
        const covenantQuorum = 1;
        const haveOnlyCovenants = false;
        const destinationChainId = BigInt(11155111);
        const destinationSmartContractAddress = Buffer.from(
          "1F98C06D8734D5A9FF0b53e3294626E62e4d232C",
          "hex",
        );
        const destinationRecipientAddress = Buffer.from(
          "130C4810D57140e1E62967cBF742CaEaE91b6ecE",
          "hex",
        );

        const outputs = vaultModule.buildStakingOutput(
          "01020304",
          0,
          stakingAmount,
          stakerPubkey,
          protocolPubkey,
          custodialPubkeys,
          covenantQuorum,
          haveOnlyCovenants,
          destinationChainId,
          destinationSmartContractAddress,
          destinationRecipientAddress,
        );
        // Decode the output buffer to a PsbtOutputExtended list
        // console.log({ output: output.map((o) => ({...o, script: bytesToHex(o.script)})) });
        console.log({ outputs });
      } catch (error) {
        console.error("Error loading the WASM module:", JSON.stringify(error));
      } finally {
        setLoading(false);
      }
    };
    loadWasmModule();
  }, []);
  return { loading, vault }; // Return loading state and vault instance
};
// Dynamically load the component without SSR
const VaultModule = dynamic(
  () =>
    Promise.resolve((props: { tag: string; version: number }) => {
      const { loading, vault } = useVaultModule();
      return loading ? (
        <div style={{ color: "white" }}>Loading Vault module...</div>
      ) : (
        <VaultModuleComponent {...props} />
      );
    }),
  { ssr: false },
);
export const useVault = () => {
  const vault = useRef<any>(null);
  return vault.current;
};
export default VaultModule;
