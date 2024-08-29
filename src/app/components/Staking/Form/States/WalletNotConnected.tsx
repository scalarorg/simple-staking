import Image from "next/image";

import { buttonStyles } from "@/app/scalar/theme";

import walletIcon from "./wallet-icon.svg";

interface WalletNotConnectedProps {
  onConnect: () => void;
}

export const WalletNotConnected: React.FC<WalletNotConnectedProps> = ({
  onConnect,
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
        <Image src={walletIcon} alt="Wallet" width={72} height={72} />
        <h3 className="font-bold">Connect wallet</h3>
        <p className="text-center text-sm font-light dark:text-neutral-content !text-[#DDDDDD]">
          Please connect wallet to start staking
        </p>
      </div>
      <button
        className={`
                btn-primary btn text-lg
                ${buttonStyles}
                `}
        onClick={onConnect}
      >
        {/*<Image src={connectIcon} alt="Connect wallet" />*/}
        Connect wallet
      </button>
    </div>
  );
};
