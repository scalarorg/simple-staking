import Link from "next/link";
import { useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useOnClickOutside } from "usehooks-ts";

import { useBtcNetwork } from "@/app/context/BtcNetworkProvider";
import { parseENV } from "@/env";

interface ChooseNetworkProps {}

export const ChooseNetwork: React.FC<ChooseNetworkProps> = ({}) => {
  const { btcNetwork, setBtcNetwork } = useBtcNetwork();
  const ProjectENV = parseENV(btcNetwork);
  const btcNetworkNameList = ProjectENV.NEXT_PUBLIC_BTC_NETWORK_LIST;

  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  const ref = useRef(null);
  useOnClickOutside(ref, handleClickOutside);

  const handleClickLink = (network: string) => {
    setBtcNetwork(network);
  };

  const hrefOfNetwork = (network: string) => {
    return network === "Mainnet" ? "/" : `/${network}`;
  };

  return (
    <div className="relative mr-[-10px] flex text-sm" ref={ref}>
      <button
        className="flex cursor-pointer outline-none max-md:flex-col-reverse max-md:items-end"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="relative right-[10px] rounded-lg border border-primary bg-[#fdf2ec] p-3 gap-4 dark:border-white dark:bg-base-200 flex justify-around items-center">
          {btcNetwork}
          <IoMdArrowDropdown />
        </div>
      </button>

      {showMenu && (
        <div
          className="absolute right-[10px] top-0 z-10 mt-[3rem] flex flex-col rounded-lg bg-base-300 p-2 shadow-lg"
          style={{
            // margin - border
            width: "calc(100%)",
          }}
        >
          {btcNetworkNameList.map((network, idx) => (
            <Link
              key={idx}
              className="btn btn-outline btn-sm"
              onClick={() => {
                handleClickLink(network);
              }}
              href={hrefOfNetwork(network)}
            >
              {network}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
