/**
 * Convert the date and time one hour from now which is earliest
 * available booking time, or the passed values to a formatted string.
 */
export default function formatDate(selectedDate?: Date) {
  // use the selected date if provided, otherwise default to one hour from now
  let dateTime: Date;
  if (selectedDate) {
    dateTime = selectedDate;
  } else {
    dateTime = new Date();
    dateTime.setHours(dateTime.getHours() + 1);
  }

  // format date: e.g. 5 April 2026
  const formattedDate = dateTime.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // format time: e.g. 13:30
  const formattedTime = dateTime.toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { formattedDate, formattedTime };
}
