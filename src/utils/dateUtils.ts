/**
 * Date Utilities
 *
 * Type-safe date manipulation and formatting utilities.
 * Converted from JavaScript to TypeScript for better type safety.
 *
 * @module dateUtils
 */

import { format, parseISO, getYear, getMonth } from 'date-fns';

/**
 * Type representing a date that can be either a Date object or ISO string
 */
export type DateInput = Date | string;

/**
 * Semester type definition
 */
export type Semester = 'Fall' | 'Spring' | 'Summer';

/**
 * Semester key format: "Season YYYY"
 */
export type SemesterKey = `${Semester} ${number}`;

/**
 * Event-like object with date property (for grouping)
 */
export interface EventWithDate {
  data: {
    date: Date;
    [key: string]: unknown;
  };
}

/**
 * Converts a date input to a Date object
 *
 * @param date - Date input (Date object or ISO string)
 * @returns Date object or null if input is invalid
 */
function toDateObject(date: DateInput | null | undefined): Date | null {
  if (!date) return null;

  if (typeof date === 'string') {
    try {
      return parseISO(date);
    } catch {
      return null;
    }
  }

  return date instanceof Date ? date : null;
}

/**
 * Formats a date in a human-readable format
 *
 * @param date - The date to format (Date object or ISO string)
 * @param formatStr - The format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string, or empty string if date is invalid
 *
 * @example
 * ```ts
 * formatDate(new Date('2024-03-15')) // => 'March 15, 2024'
 * formatDate('2024-03-15', 'yyyy-MM-dd') // => '2024-03-15'
 * formatDate(null) // => ''
 * ```
 */
export function formatDate(date: DateInput | null | undefined, formatStr: string = 'MMMM d, yyyy'): string {
  const dateObj = toDateObject(date);
  if (!dateObj) return '';

  try {
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
}

/**
 * Checks if a date is in the future
 *
 * @param date - The date to check
 * @returns True if the date is in the future, false otherwise
 *
 * @example
 * ```ts
 * isFutureDate(new Date('2099-12-31')) // => true
 * isFutureDate(new Date('2000-01-01')) // => false
 * ```
 */
export function isFutureDate(date: DateInput | null | undefined): boolean {
  const dateObj = toDateObject(date);
  if (!dateObj) return false;

  return dateObj > new Date();
}

/**
 * Checks if a date is in the past
 *
 * @param date - The date to check
 * @returns True if the date is in the past, false otherwise
 */
export function isPastDate(date: DateInput | null | undefined): boolean {
  const dateObj = toDateObject(date);
  if (!dateObj) return false;

  return dateObj < new Date();
}

/**
 * Checks if a date is today
 *
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: DateInput | null | undefined): boolean {
  const dateObj = toDateObject(date);
  if (!dateObj) return false;

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Determines the academic semester for a given date
 *
 * - Fall: August - December (months 7-11)
 * - Spring: January - May (months 0-4)
 * - Summer: June - July (months 5-6)
 *
 * @param date - The date to check
 * @returns Semester name ('Fall', 'Spring', or 'Summer')
 */
export function getSemester(date: Date): Semester {
  const month = getMonth(date); // 0-indexed

  if (month >= 7 && month <= 11) {
    return 'Fall';
  } else if (month >= 0 && month <= 4) {
    return 'Spring';
  } else {
    return 'Summer';
  }
}

/**
 * Gets the semester key (e.g., "Fall 2024") for a given date
 *
 * @param date - The date to check
 * @returns Semester key string
 */
export function getSemesterKey(date: Date): SemesterKey {
  const semester = getSemester(date);
  const year = getYear(date);
  return `${semester} ${year}`;
}

/**
 * Groups events by academic semester
 *
 * @param events - Array of events with date property
 * @returns Object mapping semester keys to event arrays
 *
 * @example
 * ```ts
 * const events = [
 *   { data: { date: new Date('2024-09-01'), title: 'Event 1' } },
 *   { data: { date: new Date('2024-10-15'), title: 'Event 2' } },
 *   { data: { date: new Date('2025-01-20'), title: 'Event 3' } },
 * ];
 *
 * groupEventsBySemester(events);
 * // Returns:
 * // {
 * //   'Fall 2024': [Event 1, Event 2],
 * //   'Spring 2025': [Event 3]
 * // }
 * ```
 */
export function groupEventsBySemester<T extends EventWithDate>(
  events: T[]
): Record<string, T[]> {
  return events.reduce((acc, event) => {
    const date = event.data.date;
    const semesterKey = getSemesterKey(date);

    if (!acc[semesterKey]) {
      acc[semesterKey] = [];
    }

    acc[semesterKey].push(event);

    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Formats a date for HTML input[type="date"]
 *
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: DateInput | null | undefined): string {
  const dateObj = toDateObject(date);
  if (!dateObj) return '';

  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Gets the relative time description (e.g., "2 days ago", "in 3 weeks")
 *
 * @param date - The date to compare
 * @returns Human-readable relative time string
 */
export function getRelativeTime(date: DateInput | null | undefined): string {
  const dateObj = toDateObject(date);
  if (!dateObj) return '';

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Compares two dates for sorting
 *
 * @param a - First date
 * @param b - Second date
 * @param order - Sort order ('asc' or 'desc')
 * @returns Comparison result for Array.sort()
 */
export function compareDates(
  a: DateInput | null | undefined,
  b: DateInput | null | undefined,
  order: 'asc' | 'desc' = 'asc'
): number {
  const dateA = toDateObject(a);
  const dateB = toDateObject(b);

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  const diff = dateA.getTime() - dateB.getTime();
  return order === 'asc' ? diff : -diff;
}
