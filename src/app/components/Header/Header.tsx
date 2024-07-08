import { ConnectSmall } from "../Connect/ConnectSmall";

import { Logo } from "./Logo";

interface HeaderProps {
  onConnect: () => void;
  address: string;
  balanceSat: number;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onConnect,
  address,
  balanceSat,
  onDisconnect,
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
          <ConnectSmall
            onConnect={onConnect}
            address={address}
            balanceSat={balanceSat}
            onDisconnect={onDisconnect}
          />
          {/*<ThemeToggle />*/}
        </div>
      </div>
      {/*<div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">*/}
      {/*  <TestingInfo />*/}
      {/*</div>*/}
    </nav>
  );
};
