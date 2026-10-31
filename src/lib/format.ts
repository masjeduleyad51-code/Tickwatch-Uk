// Sighting timestamps are timezone-less (read as UTC), so always format in UTC.
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});
const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
const number = new Intl.NumberFormat("en-GB");

export const formatDateTime = (timestamp: number): string => dateTime.format(timestamp);
export const formatDate = (timestamp: number): string => date.format(timestamp);
export const formatNumber = (value: number): string => number.format(value);
