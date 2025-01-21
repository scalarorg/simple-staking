import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { useWalletInfo, useWalletProvider } from "@/app/context/WalletProvider";
import { useERC20 } from "@/app/hooks/useERC20";
import { getWagmiChain, isSupportedChain } from "@/app/wagmi";
import { getChainID } from "@/utils/scalar/chains";
import { useVault } from "@/app/context/VaultContext";
import { useFeeRates } from "@/app/hooks/useFeeRates";
import { decodeScalarBytesToString } from "@/utils/scalar/decode";

import { toast } from "../../../ui/use-toast";
import { ToastContent } from "../components/ToastContent";
import { FormSchema, TransferFormData } from "../components/schema";
import { isBtcChain, isEvmChain } from "../utils";

import { useGateway } from "./useGateway";
import { useGatewayContract } from "./useSendToken";

export const useTransferLogic = (
  protocol: TProtocol,
  formSchema: typeof FormSchema,
) => {
  const form = useForm<TransferFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceChain: "",
      sourceChainAddress: "",
      destinationChain: "",
      destRecipientAddress: "",
      transferAmount: "0",
      btcFeeRate: "hourFee",
      customFeeRate: undefined,
    },
  });

  const vault = useVault(
    protocol.tag ? decodeScalarBytesToString(protocol.tag) : undefined,
  );

  const { btcNetwork, walletProvider, networkConfig, mempoolClient } =
    useWalletProvider();
  const {
    address: btcAddress,
    balance: btcBalance,
    pubkey: btcPubkey,
  } = useWalletInfo();
  const feeRates = useFeeRates(btcAddress, mempoolClient);

  const { address: evmAddress } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const [destChain, setDestChain] = useState<TProtocolChain>();
  const [sourceChain, setSourceChain] = useState<TProtocolChain>();

  const watchTransferAmount = form.watch("transferAmount");
  const watchSourceChain = form.watch("sourceChain");
  const watchDestinationChain = form.watch("destinationChain");
  const watchSourceChainAddress = form.watch("sourceChainAddress");

  const sourceTokenAddress = sourceChain?.address;

  const { data: gateway } = useGateway(sourceChain?.chain);

  const { balanceOf, checkAllowance, approve, approveError } = useERC20(
    sourceTokenAddress as `0x${string}`,
  );

  const {
    sendToken,
    callContractWithToken,
    isPending,
    error: gatewayError,
  } = useGatewayContract(gateway?.address as `0x${string}`);

  const { data: sourceChainBalance } = useQuery({
    queryKey: ["sourceChainBalance", protocol?.asset?.name, sourceChain?.chain],
    queryFn: async () => {
      if (!sourceChain) return BigInt(0);
      let balance = BigInt(0);
      if (isEvmChain(sourceChain)) {
        balance = await balanceOf(evmAddress as `0x${string}`);
      } else if (isBtcChain(sourceChain)) {
        balance = BigInt(btcBalance);
      }
      return balance;
    },
    enabled: !!sourceChain,
  });

  useEffect(() => {
    if (!protocol || !watchSourceChain) {
      return;
    }
    const chain = protocol.chains?.find((c) => c.chain === watchSourceChain);
    if (!chain) return;
    setSourceChain(chain);
    if (form.getValues("destinationChain") === chain.chain) {
      const otherChains = protocol.chains?.filter(
        (c) => c.chain !== chain.chain,
      );
      if (otherChains && otherChains?.length > 0) {
        setDestChain(otherChains[0]);
        form.setValue("destinationChain", otherChains[0]?.chain || "");
      }
    }
  }, [watchSourceChain, protocol, form, setDestChain]);

  useEffect(() => {
    if (!protocol || !watchDestinationChain) {
      return;
    }
    const chain = protocol.chains?.find(
      (c) => c.chain === watchDestinationChain,
    );
    if (!chain) return;
    setDestChain(chain);
    if (isBtcChain(chain)) {
      form.setValue("destRecipientAddress", btcAddress || "");
    } else if (isEvmChain(chain)) {
      form.setValue("destRecipientAddress", evmAddress || "");
    }
  }, [watchDestinationChain, protocol, form, evmAddress, btcAddress]);

  useEffect(() => {
    if (!sourceChain) return;
    if (isBtcChain(sourceChain)) {
      form.setValue("sourceChainAddress", btcAddress || "");
    } else if (isEvmChain(sourceChain)) {
      form.setValue("sourceChainAddress", evmAddress || "");
    }
  }, [sourceChain, btcAddress, evmAddress, form]);

  useEffect(() => {
    if (!sourceChain) return;
    if (!isEvmChain(sourceChain)) return;
    if (!isSupportedChain(chainId)) return;
    const sourceChainID = getChainID(sourceChain);
    if (sourceChainID && chainId !== Number(sourceChainID)) {
      switchChain({ chainId: Number(sourceChainID) });
    }
  }, [destChain, sourceChain, chainId, switchChain]);

  const onConnectWallet = useCallback(() => {
    if (isEvmChain(destChain)) {
      form.setValue("destRecipientAddress", evmAddress || "");
    } else if (isBtcChain(destChain)) {
      form.setValue("destRecipientAddress", btcAddress || "");
    }
  }, [evmAddress, btcAddress, form, destChain]);

  const showSuccessTx = useCallback(
    (txid: string, chain: string) => {
      let link = "";
      if (isBtcChain(chain)) {
        link = `${networkConfig?.mempoolApiUrl}/tx/${txid}`;
      } else if (isEvmChain(chain)) {
        const chainId = getChainID(chain);
        if (!isSupportedChain(Number(chainId))) return;
        const wagmiChain = getWagmiChain(Number(chainId));
        if (!wagmiChain) return;
        link = `${wagmiChain.blockExplorers?.default.url}/tx/${txid}`;
      }
      toast({
        title: "Transfer transaction successful",
        description: ToastContent({ txid, link }),
      });
    },
    [networkConfig?.mempoolApiUrl],
  );

  useEffect(() => {
    if (gatewayError) {
      toast({
        title: "Error",
        description:
          (gatewayError as any)?.shortMessage || "Failed to send token",
      });
      console.error({
        sendError: gatewayError,
      });
      return;
    }
    if (approveError) {
      toast({
        title: "Error",
        description:
          (approveError as any)?.shortMessage || "Failed to approve ERC20",
      });
      console.error({ approveError });
      return;
    }
  }, [gatewayError, approveError]);

  return {
    vault,
    walletProvider,
    btcNetwork,
    btcAddress,
    btcPubkey,
    feeRates,
    evmAddress,
    gateway,
    form,
    sourceChainBalance,
    destChain,
    sourceChain,
    sourceTokenAddress,
    watchTransferAmount,
    watchSourceChainAddress,
    mempoolClient,
    showSuccessTx,
    onConnectWallet,
    checkAllowance,
    approveERC20: approve,
    balanceOf,
    callContractWithToken,
    sendToken,
    isInteractingWithGateway: isPending,
  };
};
