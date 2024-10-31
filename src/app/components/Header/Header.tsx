import { buttonStyles } from "@/app/scalar/theme";

import { useNetwork } from "../../context/NetworkProvicer";
import { useWalletInfo } from "../../context/WalletProvider";
import { ConnectSmall } from "../Connect/ConnectSmall";

import { Logo } from "./Logo";

interface HeaderProps {
  onOpenMintTxModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMintTxModal }) => {
  const { network } = useNetwork();
  const { address } = useWalletInfo();
  return (
    <nav>
      <div>
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6">
          <Logo />

          <div className="grow flex gap-4 items-center justify-end">
            {address && (
              <div className="flex gap-1 items-center text-sm font-semibold">
                Network:
                <button
                  className="h-[2.5rem] min-h-[2.5rem] rounded-full px-2 text-orange-600 md:rounded-lg"
                  // TODO: open popup to select network
                  // onClick={}
                  disabled={!address}
                >
                  <span className="capitalize">{network}</span>
                </button>
                <button
                  className={`
        btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-full px-2 text-white md:rounded-lg 
        ${buttonStyles}
        `}
                  onClick={onOpenMintTxModal}
                  disabled={!address}
                >
                  <span className="hidden md:flex">Mint Token</span>
                </button>
              </div>
            )}
            <ConnectSmall />
          </div>
        </div>
      </div>
    </nav>
  );
};
