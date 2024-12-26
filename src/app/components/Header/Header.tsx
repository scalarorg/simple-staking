import { useNetwork } from "../../context/NetworkProvicer";
import { useWalletInfo } from "../../context/WalletProvider";
import { ConnectButton } from "../Connect/ConnectButton";

import { Logo } from "./Logo";
import { PageSelect } from "./PageSelect";

export const Header: React.FC = () => {
  const { network } = useNetwork();
  const { address } = useWalletInfo();
  return (
    <nav>
      <div>
        <div className="container mx-auto flex w-full items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <Logo />
            <PageSelect />
          </div>

          <div className="flex gap-4 items-center justify-end">
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
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
