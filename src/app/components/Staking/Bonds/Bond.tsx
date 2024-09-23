import { FaPenToSquare } from "react-icons/fa6";

import { Hash } from "@/app/components/Hash/Hash";
import { fpInnerStyles, fpSelectedStyles, fpStyles } from "@/app/scalar/theme";

interface BondProps {
  no: string;
  id: string;
  txhash: string;
  chainName: string;
  smAddress: string;
  amount: number;
  onClick: () => void;
  selected: boolean;
}

export const Bond: React.FC<BondProps> = ({
  no,
  id,
  txhash,
  chainName,
  smAddress,
  amount,
  onClick,
  selected,
}) => {
  const generalStyles =
    "card relative cursor-pointer border bg-base-300 p-4 text-sm transition-shadow hover:shadow-md dark:border-transparent dark:bg-base-200";

  // const BondHasData = chainName && smAddress && amount;
  const BondHasData = true;

  const handleClick = () => {
    if (BondHasData) {
      onClick();
    }
  };

  return (
    <div
      className={`
        ${generalStyles}
        ${selected ? "fp-selected" : ""}
        ${BondHasData ? "" : "opacity-50 pointer-events-none"}
        ${fpStyles}
        `}
      onClick={handleClick}
    >
      <div
        className={`
              ${fpInnerStyles}
              ${selected ? fpSelectedStyles : ""}
              `}
      >
        <div className="grid grid-cols-4 grid-rows-2 items-center gap-2 lg:grid-cols-6 lg:grid-rows-1">
          <div className="flex items-center gap-1 justify-start">{no}</div>
          <div className="flex justify-end lg:justify-start">
            <Hash value={txhash} address small noFade />
          </div>
          <div className="flex justify-end lg:justify-start">{chainName}</div>
          <div className="flex items-center gap-1 justify-start">
            <Hash value={smAddress} address small noFade />
          </div>
          <div className="flex items-center gap-1 justify-start">{amount}</div>
          <div className="flex items-center gap-1 justify-end">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => {}}
            >
              <FaPenToSquare />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
