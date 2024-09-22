import { formatDuration, intervalToDuration } from "date-fns";

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export const durationTillNow = (time: string, currentTime: number) => {
  if (!time || time.startsWith("000")) return "Ongoing";

  const duration = intervalToDuration({
    end: currentTime,
    start: new Date(time),
  });
  let format: (keyof Duration)[] = ["days", "hours", "minutes"];

  if (!duration.days && !duration.hours && !duration.minutes) {
    format.push("seconds");
  }

  const formattedTime = formatDuration(duration, {
    format,
  });

  if (formattedTime) {
    return `${formattedTime} ago`;
  } else {
    return "Just now";
  }
};

export const datetimeStringOf = (unixTime: number) => {
  const date = new Date(unixTime * 1000); // Convert seconds to milliseconds

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format the date as yyyy-mm-dd hh:mm:ss
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
};
