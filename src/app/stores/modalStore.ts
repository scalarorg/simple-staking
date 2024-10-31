import { create } from "zustand";

interface ModalState {
  isMintModalOpen: boolean;
  isNetworkModalOpen: boolean;
  openMintModal: () => void;
  closeMintModal: () => void;
  openNetworkModal: () => void;
  closeNetworkModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isMintModalOpen: false,
  isNetworkModalOpen: false,
  openMintModal: () => set({ isMintModalOpen: true }),
  closeMintModal: () => set({ isMintModalOpen: false }),
  openNetworkModal: () => set({ isNetworkModalOpen: true }),
  closeNetworkModal: () => set({ isNetworkModalOpen: false }),
}));
