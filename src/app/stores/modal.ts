import { create } from "zustand";

import { DApp as DAppInterface } from "@/app/types/dApps";

interface IModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useMintTxModal = create<IModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface IDAppModalStore extends Omit<IModalStore, "open"> {
  dApp?: DAppInterface;
  open: (dApp: DAppInterface) => void;
  close: () => void;
}

export const useDAppModal = create<IDAppModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));
