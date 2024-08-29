import { HTMLAttributes } from "react";

type Styles = HTMLAttributes<HTMLElement>["className"];

const fpStyles: Styles =
  "!bg-white/10 !backdrop-blur-[2px] !rounded-[3px] overflow-hidden !p-0";
const fpSelectedStyles: Styles =
  "border-[1.5px] [border-image:linear-gradient(45deg,white,#B86601)_1]";
const fpInnerStyles: Styles = "p-3 md:p-4 !rounded-[3px]";
const stakingStyles: Styles = "!bg-transparent !border-none !p-0";
const fpTableStyles: Styles =
  "!bg-white/[3.14%] !rounded-[12px] p-4 sm:p-6 md:p-8 border border-neutral-9";

const statsItemStyles: Styles =
  "!flex-col !items-start border px-4 md:px-8 py-2 md:py-3 !rounded-[12px] border-[#95959599] bg-white/10";
const statsItemTitleStyles: Styles =
  "!font-normal text-sm md:!text-base !text-white";
const statsItemValueStyles: Styles =
  "!font-normal text-[#B27A19] text-base md:text-lg";
const statsContainerStyles: Styles =
  "!flex-col !p-0 !justify-end !bg-transparent !shadow-none max-md:gap-2";
const statsSectionStyles: Styles =
  "md:!flex-row !bg-transparent !justify-end !p-0 gap-2 md:gap-3 max-md:!flex-col";

const historyContainerStyles: Styles = fpTableStyles;

const logoStyles: Styles = "";

const buttonStyles: Styles =
  "!bg-white/50 hover:!bg-white/30 !rounded-[8px] ease-out duration-300 [box-shadow:3px_8px_8px_0px_rgba(0,0,0,0.15)] !border-none !text-purplish-black";

export {
  buttonStyles,
  fpInnerStyles,
  fpSelectedStyles,
  fpStyles,
  fpTableStyles,
  historyContainerStyles,
  logoStyles,
  stakingStyles,
  statsContainerStyles,
  statsItemStyles,
  statsItemTitleStyles,
  statsItemValueStyles,
  statsSectionStyles,
};
