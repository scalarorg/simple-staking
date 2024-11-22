import { DApp } from "../types/dApps";

export const useExchangeRate = (dApp: DApp, unstakeAmount: string) => {
  return Number(unstakeAmount);
};
