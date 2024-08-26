import { buttonStyles } from "@/app/scalar/theme";

import { ConnectSmall } from "../Connect/ConnectSmall";

import { Logo } from "./Logo";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  balanceSat: number;
  onDisconnect: () => void;
  onOpenMintTxModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  balanceSat,
  onDisconnect,
  onOpenMintTxModal,
}) => {
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
          <div className="flex gap-3 items-center">
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

            <ConnectSmall
              onConnect={onConnect}
              address={address}
              balanceSat={balanceSat}
              onDisconnect={onDisconnect}
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
