import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { z } from "zod";

import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";

import { GeneralModal } from "./GeneralModal";

interface SignTxModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onSign: (privkey: string) => void;
  address: string;
}

const FormSchema = z.object({
  inputPrivateKey: z.string({
    required_error: "Please enter your private key for signing.",
  }),
});

export const SignTxModal: React.FC<SignTxModalProps> = ({
  open,
  onClose,
  onSign,
  address,
}) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inputPrivateKey: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { inputPrivateKey } = data;
    onSign(inputPrivateKey);
  }

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between z-100">
        <h3 className="font-bold">Signing Transaction With Private Key</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <div className="my-4 flex flex-col gap-4">
          <h3 className="text-left font-semibold">Address</h3>
          <div className="grid max-h-[20rem] grid-cols-1 gap-4 overflow-y-auto">
            {address}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="inputPrivateKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-500">
                  Signing Private Key
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
