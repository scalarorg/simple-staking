import {
  getNetworkConfig,
  network,
  validateAddress,
} from "@/config/network.config";

import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../mempool_api";
import {
  Fees,
  Network,
  UTXO,
  UnisatOptions,
  WalletInfo,
  WalletProvider,
} from "../wallet_provider";

// Internal network names
const INTERNAL_NETWORK_NAMES = {
  [Network.MAINNET]: "livenet",
  [Network.TESTNET]: "testnet",
  [Network.SIGNET]: "signet",
};

// window object for Unisat Wallet extension
export const unisatProvider = "unisat";

export class UnisatWallet extends WalletProvider {
  private unisatWalletInfo: WalletInfo | undefined;
  private unisatWallet: any;
  private bitcoinNetworkProvider: any;
  private networkEnv: Network | undefined;

  constructor() {
    super();

    // check whether there is an Unisat Wallet extension
    if (!window[unisatProvider]) {
      throw new Error("Unisat Wallet extension not found");
    }

    this.unisatWallet = window[unisatProvider];
    this.networkEnv = getNetworkConfig().network;

    // Unisat uses different providers for different networks
    this.bitcoinNetworkProvider = this.unisatWallet;
  }

  connectWallet = async (): Promise<this> => {
    const workingVersion = "1.4.5";

    const version = await window[unisatProvider].getVersion();
    if (version < workingVersion) {
      throw new Error("Please update Unisat Wallet to the latest version");
    }

    switch (this.networkEnv) {
      case Network.MAINNET:
        await this.bitcoinNetworkProvider.switchNetwork(
          INTERNAL_NETWORK_NAMES.mainnet,
        );
        break;
      case Network.TESTNET:
        await this.bitcoinNetworkProvider.switchNetwork(
          INTERNAL_NETWORK_NAMES.testnet,
        );
        break;
      case Network.SIGNET:
        await this.bitcoinNetworkProvider.switchNetwork(
          INTERNAL_NETWORK_NAMES.signet,
        );
        break;
      default:
        throw new Error("Unsupported network");
    }

    // try {
    //   await this.unisatWallet.enable(); // Connect to Unisat Wallet extension
    // } catch (error) {
    //   if ((error as Error)?.message?.includes("rejected")) {
    //     throw new Error("Connection to Unisat Wallet was rejected");
    //   } else {
    //     throw new Error((error as Error)?.message);
    //   }
    // }
    let result = null;
    try {
      // this will not throw an error even if user has no network enabled
      result = await this.bitcoinNetworkProvider.requestAccounts();
    } catch (error) {
      throw new Error(
        `BTC ${this.networkEnv} is not enabled in Unisat Wallet, ${error}`,
      );
    }

    const address = result[0];

    validateAddress(network, address);

    const compressedPublicKey =
      await this.bitcoinNetworkProvider.getPublicKey();

    if (compressedPublicKey && address) {
      this.unisatWalletInfo = {
        publicKeyHex: compressedPublicKey,
        address,
      };
      return this;
    } else {
      throw new Error("Could not connect to Unisat Wallet");
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Unisat";
  };

  getAddress = async (): Promise<string> => {
    if (!this.unisatWalletInfo) {
      throw new Error("Unisat Wallet not connected");
    }
    return this.unisatWalletInfo.address;
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (!this.unisatWalletInfo) {
      throw new Error("Unisat Wallet not connected");
    }
    return this.unisatWalletInfo.publicKeyHex;
  };

  signPsbt = async (
    psbtHex: string,
    options?: UnisatOptions,
  ): Promise<string> => {
    if (!this.unisatWalletInfo) {
      throw new Error("unisat Wallet not connected");
    }
    // Use signPsbt since it shows the fees
    return await this.bitcoinNetworkProvider.signPsbt(psbtHex, options);
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!this.unisatWalletInfo) {
      throw new Error("Unisat Wallet not connected");
    }
    // sign the PSBTs
    return await this.bitcoinNetworkProvider.signPsbts(psbtsHexes);
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    if (!this.unisatWalletInfo) {
      throw new Error("Unisat Wallet not connected");
    }
    return await this.bitcoinNetworkProvider.signMessage(
      message,
      "bip322-simple",
    );
  };

  getNetwork = async (): Promise<Network> => {
    // unisat does not provide a way to get the network for Signet and Testnet
    // So we pass the check on connection and return the environment network
    if (!this.networkEnv) {
      throw new Error("Network not set");
    }
    return this.networkEnv;
  };

  on = (eventName: string, callBack: () => void) => {
    if (!this.unisatWalletInfo) {
      throw new Error("Unisat Wallet not connected");
    }
    // subscribe to account change event
    if (eventName === "accountChanged") {
      return this.unisatWallet.on(eventName, callBack);
    }
  };

  // Mempool calls

  getBalance = async (): Promise<number> => {
    return await getAddressBalance(await this.getAddress());
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return await pushTx(txHex);
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
