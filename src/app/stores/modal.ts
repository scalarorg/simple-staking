import { create } from "zustand";

import { DApp as DAppInterface } from "@/app/types/dApps";

import { Bond } from "../types/bonds";

interface IModalStore {
  isOpen: boolean;
  dApp?: DAppInterface;
  open: (dApp?: DAppInterface) => void;
  close: () => void;
}

export const useMintTxModal = create<IModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp?: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));

export const useDAppModal = create<IModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp?: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));

export const useAddDAppModal = create<IModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface IUnbondModalStore {
  isOpen: boolean;
  bond?: Bond;
  open: (bond?: Bond) => void;
  close: () => void;
}

export const useUnbondModal = create<IUnbondModalStore>((set) => ({
  isOpen: false,
  bond: undefined,
  open: (bond?: Bond) => set({ isOpen: true, bond }),
  close: () => set({ isOpen: false, bond: undefined }),
}));

export const useStakeCustodianModal = create<IModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp?: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));

export const useUnstakeCustodianModal = create<IModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp?: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));
