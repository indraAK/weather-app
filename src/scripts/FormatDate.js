export default function formatDate(created) {
  const date = new Date(created);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayOfTheWeek = days[date.getDay()];
  const dayOfTheMonth = date.getDate();
  const month = months[date.getMonth()];

  return `${dayOfTheWeek}, ${dayOfTheMonth} ${month}`;
}
