import { Control } from "react-hook-form";
import { Button } from "./button";
import { FormControl, FormField, FormItem, FormMessage } from "./form";
import { Input } from "./input";

interface FeeRates {
  fastestFee: number;
  hourFee: number;
  minimumFee: number;
}

interface TransactionRateSelectProps {
  control: Control<any>;
  feeRates: FeeRates;
}

export const TransactionRateSelect: React.FC<TransactionRateSelectProps> = ({
  control,
  feeRates,
}) => {
  return (
    <FormField
      control={control}
      name="mintFeeRate"
      render={({ field }) => (
        <FormItem>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={field.value === "fastestFee" ? "default" : "outline"}
                onClick={() => field.onChange("fastestFee")}
                className="flex flex-col items-center justify-center h-auto py-2"
              >
                <span>Fastest</span>
                <span className="text-sm">({feeRates.fastestFee} sat/vB)</span>
              </Button>
              <Button
                type="button"
                variant={field.value === "hourFee" ? "default" : "outline"}
                onClick={() => field.onChange("hourFee")}
                className="flex flex-col items-center justify-center h-auto py-2"
              >
                <span>Medium</span>
                <span className="text-sm">({feeRates.hourFee} sat/vB)</span>
              </Button>
              <Button
                type="button"
                variant={field.value === "minimumFee" ? "default" : "outline"}
                onClick={() => field.onChange("minimumFee")}
                className="flex flex-col items-center justify-center h-auto py-2"
              >
                <span>Minimum</span>
                <span className="text-sm">({feeRates.minimumFee} sat/vB)</span>
              </Button>
              <Button
                type="button"
                variant={
                  field.value !== "fastestFee" &&
                  field.value !== "hourFee" &&
                  field.value !== "minimumFee"
                    ? "default"
                    : "outline"
                }
                onClick={() => {
                  field.onChange("custom");
                }}
                className="flex items-center justify-center h-auto py-2"
              >
                Custom
              </Button>
            </div>
            {field.value === "custom" && (
              <FormField
                control={control}
                name="customFeeRate"
                render={({ field: customField }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...customField}
                        type="number"
                        placeholder="Custom fee rate (sat/vB)"
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value > 0) {
                            customField.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
