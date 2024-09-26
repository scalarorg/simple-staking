import { ChangeEvent, FocusEvent, useEffect, useState } from "react";

interface ChainNameProps {
  onChange: (input: string) => void;
  reset: boolean;
  initValue: string;
  chainNames: string[];
  isCustom?: boolean;
  setIsCustom?: (isCustom: boolean) => void;
}

export const ChainName: React.FC<ChainNameProps> = ({
  onChange,
  reset,
  initValue,
  chainNames,
  isCustom = false,
  setIsCustom = () => {},
}) => {
  const [value, setValue] = useState(initValue);
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);
  const [customValue, setCustomValue] = useState(""); // Store custom input value

  const generalErrorMessage = "You should select a chain name";

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue(initValue);
    setError("");
    setTouched(false);
  }, [reset, initValue]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;

    if (newValue === "custom") {
      setIsCustom(true); // Show the input field for custom
    } else {
      setIsCustom(false); // Hide the input field when not custom
      setValue(newValue);
      onChange(newValue);
    }

    if (touched && newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  const handleCustomInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newCustomValue = e.target.value;
    setCustomValue(newCustomValue);
    onChange(newCustomValue);
  };

  const handleBlur = (_e: FocusEvent<HTMLSelectElement | HTMLInputElement>) => {
    setTouched(true);

    if (!isCustom && value === "") {
      onChange("");
      setError(generalErrorMessage);
    }

    if (isCustom && customValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  return (
    <label className="form-control w-full flex-1">
      <div className="label">
        <span className="label-text-alt text-base">Chain Name</span>
      </div>
      {!isCustom ? (
        <select
          className={`select select-bordered w-full mt-2 ${error && "input-error"}`}
          value={value}
          onChange={handleSelectChange}
          onBlur={handleBlur}
        >
          <option value="">Chain Type</option>
          {chainNames.map((chainName, idx) => (
            <option key={idx} value={chainName}>
              {chainName}
            </option>
          ))}
          {/* TODO: Add custom chain later */}
          {/* <option value="custom">Custom</option> */}
        </select>
      ) : (
        <input
          className={`input input-bordered w-full mt-2 ${error && "input-error"}`}
          type="text"
          value={customValue}
          onChange={handleCustomInputChange}
          onBlur={handleBlur}
          placeholder="Enter custom chain name"
        />
      )}
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};
