import { create } from "zustand";

import { Bond } from "@/app/types/bonds";
import { CustodianGroup } from "@/app/types/custodians";
import { DeleteProtocolRequest, Protocol } from "@/app/types/protocol";

interface IProtocolModalStore {
  isOpen: boolean;
  protocol?: Protocol;
  open: (protocol?: Protocol) => void;
  close: () => void;
}

interface IDeleteProtocolModalStore {
  isOpen: boolean;
  protocolData?: DeleteProtocolRequest;
  open: (protocolData?: DeleteProtocolRequest) => void;
  close: () => void;
}

interface ICustodianGroupModalStore {
  isOpen: boolean;
  custodianGroup?: CustodianGroup;
  open: (custodianGroup?: CustodianGroup) => void;
  close: () => void;
}

export const useMintTxModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useProtocolModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
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
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useUnstakeCustodianModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  protocol: undefined,
  open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
  close: () => set({ isOpen: false, protocol: undefined }),
}));

export const useAddProtocolModal = create<IProtocolModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const useDeleteProtocolModal = create<IDeleteProtocolModalStore>(
  (set) => ({
    isOpen: false,
    protocolData: undefined,
    open: (protocolData?: DeleteProtocolRequest) =>
      set({ isOpen: true, protocolData }),
    close: () => set({ isOpen: false, protocolData: undefined }),
  }),
);

export const useAddDestinationChainModal = create<IProtocolModalStore>(
  (set) => ({
    isOpen: false,
    protocol: undefined,
    open: (protocol?: Protocol) => set({ isOpen: true, protocol }),
    close: () => set({ isOpen: false, protocol: undefined }),
  }),
);

export const useAddCustodianGroupModal = create<ICustodianGroupModalStore>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }),
);

export const useCustodianGroupModal = create<ICustodianGroupModalStore>(
  (set) => ({
    isOpen: false,
    custodianGroup: undefined,
    open: (custodianGroup?: CustodianGroup) =>
      set({ isOpen: true, custodianGroup }),
    close: () => set({ isOpen: false, custodianGroup: undefined }),
  }),
);
