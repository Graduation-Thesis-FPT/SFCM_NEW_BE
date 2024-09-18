export function getDaysDifference(date1: Date, date2: Date): number {
  const oneDayInMs = 1000 * 60 * 60 * 24; // Milliseconds in one day
  const diffInMs = Math.abs(date2.getTime() - date1.getTime()); // Absolute difference in milliseconds
  return Math.ceil(diffInMs / oneDayInMs); // Convert milliseconds to days
}
