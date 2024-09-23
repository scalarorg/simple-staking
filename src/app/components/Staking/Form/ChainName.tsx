import { ChangeEvent, FocusEvent, useEffect, useState } from "react";

interface ChainNameProps {
  onChange: (input: string) => void;
  reset: boolean;
  initValue: string;
}

export const ChainName: React.FC<ChainNameProps> = ({
  onChange,
  reset,
  initValue,
}) => {
  const [value, setValue] = useState(initValue);
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const generalErrorMessage = "You should input a chain name";

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue(initValue);
    setError("");
    setTouched(false);
  }, [reset, initValue]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;

    // Allow the input to be changed freely
    setValue(newValue);
    onChange(newValue);

    if (touched && newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };
  const handleBlur = (_e: FocusEvent<HTMLSelectElement>) => {
    setTouched(true);

    if (value === "") {
      onChange("");
      setError(generalErrorMessage);
      return;
    }
  };
  return (
    <label className="form-control w-full flex-1">
      <div className="label">
        <span className="label-text-alt text-base">Chain Name</span>
      </div>
      <select
        className={`select select-bordered w-full mt-2 ${error && "input-error"}`}
        value={value}
        onChange={handleSelectChange}
        onBlur={handleBlur}
      >
        <option value="">Chain Type</option>
        <option value="ethereum-sepolia">ethereum-sepolia</option>
        <option value="ethereum-local">ethereum-local</option>
        <option value="bitcoin">bitcoin</option>
        <option value="avalanche">avalanche</option>
      </select>
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};
