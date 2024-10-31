import { create } from "zustand";

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
