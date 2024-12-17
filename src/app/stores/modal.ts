import { create } from "zustand";

import { DApp as DAppInterface } from "@/app/types/dApps";

import { Bond } from "../types/bonds";
import { Protocol } from "../types/protocol";

interface IModalStore {
  isOpen: boolean;
  dApp?: DAppInterface;
  open: (dApp?: DAppInterface) => void;
  close: () => void;
}

interface IProtocolModalStore {
  isOpen: boolean;
  protocol?: Protocol;
  open: (protocol?: Protocol) => void;
  close: () => void;
}

export const useMintTxModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useDAppModal = create<IModalStore>((set) => ({
  isOpen: false,
  dApp: undefined,
  open: (dApp?: DAppInterface) => set({ isOpen: true, dApp }),
  close: () => set({ isOpen: false, dApp: undefined }),
}));

export const useProtocolModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
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

export const useStakeCustodianModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useUnstakeCustodianModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));
