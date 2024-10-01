import { ConnectSmall } from "@/app/components/Connect/ConnectSmall";
import { buttonStyles } from "@/app/scalar/theme";

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
  const handleSelectChange = () => {};
  const handleBlur = () => {};

  return (
    <nav>
      {/*<div className="bg-base-300 shadow-sm">*/}
      <div>
        <div className="container mx-auto flex w-full items-center justify-between gap-4 p-6">
          <div className="flex gap-4">
            <Logo />
            <select
              className={`select select-bordered`}
              value={""}
              onChange={handleSelectChange}
              onBlur={handleBlur}
            >
              <option value="">Testnet 3</option>
              <option value="">Testnet 4</option>
              <option value="">Regtest</option>
            </select>
          </div>

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
