import { ConnectSmall } from "@/app/components/Connect/ConnectSmall";
import { buttonStyles } from "@/app/scalar/theme";

import { useNetwork } from "../NetworkProvicer";
import { Logo } from "./Logo";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  balanceSat: number;
  onDisconnect: () => void;
  onOpenMintTxModal: () => void;
  onOpenBurnTokenModal: () => void;
  onOpenExportPrivateKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  balanceSat,
  onDisconnect,
  onOpenMintTxModal,
  onOpenBurnTokenModal,
  onOpenExportPrivateKeyModal,
}) => {
  const { network } = useNetwork();
  return (
    <nav>
      {/*<div className="bg-base-300 shadow-sm">*/}
      <div>
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6">
          <Logo />
          {/*<div className="flex flex-1">*/}
          {/*  <div className="hidden flex-1 xl:flex">*/}
          {/*    <TestingInfo />*/}
          {/*  </div>*/}
          {/*</div>*/}

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
            <ConnectSmall
              onConnect={onConnect}
              address={address}
              balanceSat={balanceSat}
              onDisconnect={onDisconnect}
              onExportPrivateKey={onOpenExportPrivateKeyModal}
            />
          </div>

          {/*<ThemeToggle />*/}
        </div>
      </div>
      {/*<div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">*/}
      {/*  <TestingInfo />*/}
      {/*</div>*/}
    </nav>
  );
};
