import { ChangeEvent, FocusEvent, useEffect, useState } from "react";

interface BtcAddressProps {
  onChange: (input: string) => void;
  reset: boolean;
  initValue: string;
  label?: string;
}

export const BtcAddress: React.FC<BtcAddressProps> = ({
  onChange,
  reset,
  initValue,
  label = "Bitcoin Address",
}) => {
  const [value, setValue] = useState(initValue);
  const [error, setError] = useState("");
  // Track if the input field has been interacted with
  const [touched, setTouched] = useState(false);

  const generalErrorMessage = "You should input a BTC address";

  // Use effect to reset the state when reset prop changes
  useEffect(() => {
    setValue(initValue);
    setError("");
    setTouched(false);
  }, [reset, initValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
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
        <span className="label-text-alt text-base">{label}</span>
      </div>
      <input
        type="string"
        className={`no-focus input input-bordered w-full ${error && "input-error"}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0x"
      />
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};
