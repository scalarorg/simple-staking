import { formatDistanceToNow } from "date-fns";

export const getRelativeTime = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
  return formatDistanceToNow(date, { addSuffix: true });
};
