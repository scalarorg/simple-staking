import { create } from "zustand";

import { Bond } from "@/app/types/bonds";

type ModalType = "connect" | "transfer" | "general";

interface IGeneralModalStore {
  modalState: Record<ModalType, boolean>;
  open: (type: ModalType) => void;
  close: (type: ModalType) => void;
  isOpen: (type: ModalType) => boolean;
}

export const useGeneralModal = create<IGeneralModalStore>((set, get) => ({
  modalState: {
    connect: false,
    transfer: false,
    general: false,
  },
  open: (type: ModalType) =>
    set((state) => ({
      modalState: { ...state.modalState, [type]: true },
    })),
  close: (type: ModalType) =>
    set((state) => ({
      modalState: { ...state.modalState, [type]: false },
    })),
  isOpen: (type: ModalType) => get().modalState[type],
}));

interface IProtocolModalStore {
  isOpen: boolean;
  protocol?: TProtocol;
  open: (protocol?: TProtocol) => void;
  close: () => void;
}

export const useMintTxModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useProtocolModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
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
  open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useUnstakeCustodianModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useAddProtocolModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useAddDestinationChainModal = create<IProtocolModalStore>(
  (set) => ({
    isOpen: false,
    protocol: undefined,
    open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
    close: () => set({ isOpen: false, protocol: undefined }),
  }),
);

interface ITransferModalStore {
  isOpen: boolean;
  protocol?: TProtocol;
  open: (protocol?: TProtocol) => void;
  close: () => void;
}

export const useTransferModal = create<ITransferModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: TProtocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));
