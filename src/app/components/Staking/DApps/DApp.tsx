import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { Hash } from "@/app/components/Hash/Hash";
import { fpInnerStyles, fpSelectedStyles, fpStyles } from "@/app/scalar/theme";

import Toggle from "../../Toggle/Toggle";

interface DAppProps {
  id: string;
  chainName: string;
  btcAddress: string;
  btcPk: string;
  state: boolean;
  onClick: () => void;
  selected: boolean;
}
export const DApp: React.FC<DAppProps> = ({
  id,
  chainName,
  btcAddress,
  btcPk,
  state,
  onClick,
  selected,
}) => {
  const generalStyles =
    "card relative cursor-pointer border bg-base-300 p-4 text-sm transition-shadow hover:shadow-md dark:border-transparent dark:bg-base-200";

  const dAppHasData = chainName && btcAddress && btcPk;

  const handleClick = () => {
    if (dAppHasData) {
      onClick();
    }
  };

  return (
    <div
      className={`
        ${generalStyles}
        ${selected ? "fp-selected" : ""}
        ${dAppHasData ? "" : "opacity-50 pointer-events-none"}
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
        <div className="grid grid-cols-stakingFinalityProvidersMobile grid-rows-2 items-center gap-2 lg:grid-cols-stakingDAppDesktop lg:grid-rows-1">
          <div className="flex items-center gap-1 justify-start">
            <Hash value={id} address small noFade />
          </div>
          {dAppHasData ? (
            <div className="flex justify-end lg:justify-start">
              <p>{chainName}</p>
            </div>
          ) : (
            <div className="flex justify-end lg:justify-start">
              <span
                className="cursor-pointer text-xs text-error"
                data-tooltip-id="tooltip-missing-fp"
                data-tooltip-content="This finality provider did not provide any information."
                data-tooltip-place="top"
              >
                <AiOutlineInfoCircle size={16} />
              </span>
              <Tooltip id="tooltip-missing-fp" />
              <span>No data provided</span>
            </div>
          )}
          <div className="flex items-center gap-1 justify-start">
            <Hash value={btcAddress} address small noFade />
          </div>
          <div className="flex justify-end lg:justify-start">
            <Hash value={btcPk} address small noFade />
          </div>
          <div className="flex items-center gap-1 justify-start">
            <p className="hidden sm:flex lg:hidden">State:</p>
            {dAppHasData ? <Toggle state={state} id={id} /> : "-"}
            <span
              className="inline-flex cursor-pointer text-xs sm:hidden"
              data-tooltip-id={`tooltip-delegation-${btcPk}`}
              data-tooltip-content="State"
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id={`tooltip-delegation-${btcPk}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
