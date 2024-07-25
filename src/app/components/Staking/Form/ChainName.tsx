import { ChangeEvent, useEffect, useState } from "react";

interface ChainNameProps {
  onChange: (input: string) => void;
  reset: boolean;
}

export const ChainName: React.FC<ChainNameProps> = ({ onChange, reset }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const generalErrorMessage = "You should input a chain name";

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue("");
    setError("");
    setTouched(false);
  }, [reset]);

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

  return (
    <label className="form-control w-full flex-1">
      <div className="label">
        <span className="label-text-alt text-base">Chain Name</span>
      </div>
      <select
        className={`select select-bordered w-full mt-2 ${error && "input-error"}`}
        value={value}
        onChange={handleSelectChange}
      >
        <option>Chain Type</option>
        <option>ethereum-sepolia</option>
        <option>bitcoin</option>
        <option>avalanche</option>
      </select>
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};
