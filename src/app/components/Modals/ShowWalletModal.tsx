import { IoMdClose } from "react-icons/io";

import { Hash } from "../Hash/Hash";

import { GeneralModal } from "./GeneralModal";

interface ShowWalletModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  address: string;
  pubkey: string;
  privkey: string;
}

export const ShowWalletModal: React.FC<ShowWalletModalProps> = ({
  open,
  onClose,
  address,
  pubkey,
  privkey,
}) => {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Regtest Wallet Export Private Key</h3>
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
            <Hash value={address} address noFade fullWidth doNotTrim />
          </div>
          <h3 className="text-left font-semibold">Public Key</h3>
          <div className="grid max-h-[20rem] grid-cols-1 gap-4 overflow-y-auto">
            <Hash value={pubkey} address noFade fullWidth doNotTrim />
          </div>
          <h3 className="text-left font-semibold">Private Key</h3>
          <div className="grid max-h-[20rem] grid-cols-1 gap-4 overflow-y-auto">
            <Hash value={privkey} address noFade fullWidth doNotTrim />
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};
