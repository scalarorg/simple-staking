import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import { buttonStyles } from "@/app/scalar/theme";

interface AddDAppButtonProps {
  onAdd: () => void;
}

export const AddDAppButton: React.FC<AddDAppButtonProps> = ({ onAdd }) => {
  const [showMenu, setShowMenu] = useState(false);
  const handleClickOutside = () => {
    setShowMenu(false);
  };

  const ref = useRef(null);
  useOnClickOutside(ref, handleClickOutside);

  return (
    <button
      className={`
        btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-full px-2 text-white md:rounded-lg 
        ${buttonStyles}
        `}
      onClick={onAdd}
    >
      Add DApp
    </button>
  );
};
