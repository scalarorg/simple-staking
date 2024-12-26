import { ChangeEvent, FocusEvent, useEffect, useState } from "react";

interface SelectFieldProps {
  onChange: (input: string) => void;
  reset: boolean;
  initValue: string;
  options: string[];
  label: string;
  placeholder: string;
  errorMessage?: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  onChange,
  reset,
  initValue,
  options,
  label,
  placeholder,
  errorMessage = "Please make a selection",
  disabled = false,
}) => {
  const [value, setValue] = useState(initValue);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const generalErrorMessage = errorMessage;

  useEffect(() => {
    setValue(initValue);
    setError("");
    setTouched(false);
  }, [reset, initValue]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);

    if (touched && newValue === "") {
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
    setTouched(true);

    if (value === "") {
      onChange("");
      setError(generalErrorMessage);
    } else {
      setError("");
    }
  };

  return (
    <label className="form-control w-full flex-1">
      <div className="label">
        <span className="label-text-alt text-base">{label}</span>
      </div>
      <select
        className={`select select-bordered w-full ${error && "input-error"}`}
        value={value}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="mb-2 mt-4 min-h-[20px]">
        <p className="text-center text-sm text-error">{error}</p>
      </div>
    </label>
  );
};
