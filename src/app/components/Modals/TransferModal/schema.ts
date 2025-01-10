import { z } from "zod";

export const FormSchema = z.object({
  sourceChain: z.string({
    required_error: "Please select a source chain.",
  }),
  sourceChainAddress: z.string({
    required_error: "Please enter your source chain address.",
  }),
  destinationChain: z.string({
    required_error: "Please select a destination chain.",
  }),
  destRecipientAddress: z.string({
    required_error: "Please enter your token receiver address.",
  }),
  transferAmount: z.coerce
    .string({
      required_error: "Please enter the amount.",
    })
    .min(1, "Amount must be greater than 0"),
  btcFeeRate: z.string().default("hourFee"),
  customFeeRate: z.coerce
    .number()
    .int("Please enter a whole number.")
    .positive("Please enter a positive number.")
    .optional(),
});

export type TransferFormData = z.infer<typeof FormSchema>;
