import { useState } from "react";

import { toggleDApp } from "@/app/api/toggleDApp";

interface ToggleProps {
  state: boolean;
  id: string;
}

export const Toggle: React.FC<ToggleProps> = ({ state, id }) => {
  const [isOn, setIsOn] = useState(state);

  const handleToggle = async () => {
    await toggleDApp(id);
    setIsOn(!isOn);
  };

  return (
    <div
      onClick={handleToggle}
      className={`${
        isOn ? "bg-gray-300" : "bg-base-100"
      } relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ease-in-out`}
    >
      <span
        className={`${
          isOn ? "translate-x-1" : "translate-x-6"
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out`}
      />
    </div>
  );
};

export default Toggle;
