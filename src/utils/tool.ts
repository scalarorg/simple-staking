import { formatDistanceToNow } from "date-fns";

export const getRelativeTime = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
  return formatDistanceToNow(date, { addSuffix: true });
};

export const getBitcoinVaultChainType = (
  chainType: string,
  chainTypeStrings: string[],
): string => {
  const result = chainTypeStrings.find(
    (str) => str.toLowerCase() === chainType.toLocaleLowerCase(),
  );
  if (!result) {
    throw new Error(`Invalid chain type: ${chainType}`);
  }
  return result;
};
