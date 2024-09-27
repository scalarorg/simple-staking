import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { z } from "zod";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import { GeneralModal } from "./GeneralModal";

interface SignTxModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onSign: (value: boolean) => void;
  stakerAddress: string;
  stakingAmount: number;
  tokenReceiveAddress: string;
  tokenAmount: number;
}

const FormSchema = z.object({});

export const SignTxModal: React.FC<SignTxModalProps> = ({
  open,
  onClose,
  onSign,
  stakerAddress,
  stakingAmount,
  tokenReceiveAddress,
  tokenAmount,
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    onSign(true);
  }

  function onCloseGeneralModal(toClose: boolean) {
    onClose(toClose);
    onSign(false);
  }

  return (
    <GeneralModal open={open} onClose={onCloseGeneralModal}>
      <div className="mb-4 flex items-center justify-between z-100">
        <h3 className="font-bold">Signing Mint Transaction</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => {
            onSign(false);
            onClose(false);
          }}
        >
          <IoMdClose size={24} />
        </button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormItem>
            <FormLabel className="text-gray-200">
              Source chain address
            </FormLabel>
            <FormControl>
              <Input disabled placeholder={stakerAddress} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-gray-200">
              Bitcoin Staking Amount (sats)
            </FormLabel>
            <FormControl>
              <Input disabled placeholder={stakingAmount.toLocaleString()} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-gray-200">
              Token Receive Address
            </FormLabel>
            <FormControl>
              <Input disabled placeholder={tokenReceiveAddress} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-gray-200">Token Amount</FormLabel>
            <FormControl>
              <Input disabled placeholder={tokenAmount.toLocaleString()} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className="flex justify-end">
            <Button className="" variant="outline" type="submit">
              Mint sBTC
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
