import { format, parseISO, getYear, getMonth } from "date-fns";

/**
 * Format a date in a human-readable format
 * @param {Date|string} date The date to format
 * @param {string} formatStr The format string (default: 'MMMM d, yyyy')
 * @returns {string} The formatted date
 */
export function formatDate(date, formatStr = "MMMM d, yyyy") {
  if (!date) return "";
  
  // If date is a string, parse it
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  return format(dateObj, formatStr);
}

/**
 * Check if a date is in the future
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj >= tomorrow;
}

/**
 * Check if a date is today or in the future
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is today or later
 */
export function isTodayOrFuture(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return dateObj >= startOfToday;
}

/**
 * Check if a date is in the past (before today)
 * @param {Date|string} date The date to check
 * @returns {boolean} True if the date is before today
 */
export function isPastDate(date) {
  if (!date) return false;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return dateObj < startOfToday;
}

/**
 * Group events by semester (Fall, Spring, Summer)
 * @param {Array} events The array of events to group
 * @returns {Object} An object with semester keys and event arrays as values
 */
export function groupEventsBySemester(events) {
  return events.reduce((acc, event) => {
    const date = event.data.date; // event.data.date is already a Date object
    const year = getYear(date);
    const month = getMonth(date); // 0-indexed (0 for January)

    let semester;
    if (month >= 7 && month <= 11) { // August to December
      semester = `Fall ${year}`;
    } else if (month >= 0 && month <= 4) { // January to May
      semester = `Spring ${year}`;
    } else { // June, July
      semester = `Summer ${year}`;
    }

    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(event);

    return acc;
  }, {});
}