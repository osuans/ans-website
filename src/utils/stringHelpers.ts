/**
 * String Manipulation Utilities
 *
 * Pure functions for string operations used across the application.
 *
 * @module stringHelpers
 */

/**
 * Escapes double quotes in a string for YAML frontmatter
 *
 * Converts: `John "Johnny" Doe`
 * To: `John \"Johnny\" Doe`
 *
 * @param str - String to escape
 * @returns Escaped string safe for YAML
 */
export function escapeYamlString(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Escapes a string for safe inclusion in YAML frontmatter
 * Handles quotes and special YAML characters
 *
 * @param str - String to escape
 * @returns YAML-safe string
 */
export function toYamlSafeString(str: string): string {
  // Escape quotes
  let safe = escapeYamlString(str);

  // Wrap in quotes if contains special characters
  if (/[:#\[\]{}|>]/.test(safe)) {
    safe = `"${safe}"`;
  }

  return safe;
}

/**
 * Converts a newline-separated string into a YAML array
 *
 * @param text - Multi-line text
 * @param indent - Number of spaces to indent (default: 2)
 * @returns YAML array format string
 *
 * @example
 * ```ts
 * const input = "Item 1\nItem 2\nItem 3";
 * toYamlArray(input);
 * // Returns:
 * //   - "Item 1"
 * //   - "Item 2"
 * //   - "Item 3"
 * ```
 */
export function toYamlArray(text: string, indent: number = 2): string {
  const spaces = ' '.repeat(indent);
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => `${spaces}- "${escapeYamlString(line.trim())}"`)
    .join('\n');
}

/**
 * Truncates a string to a maximum length, adding ellipsis if needed
 *
 * @param str - String to truncate
 * @param maxLength - Maximum length (default: 100)
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number = 100, suffix: string = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word
 *
 * @param str - String to title case
 * @returns Title-cased string
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Removes extra whitespace and normalizes line breaks
 *
 * @param str - String to clean
 * @returns Cleaned string
 */
export function cleanWhitespace(str: string): string {
  return str
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/[ \t]+/g, ' ') // Collapse horizontal whitespace
    .trim();
}

/**
 * Checks if a string is empty or contains only whitespace
 *
 * @param str - String to check
 * @returns true if empty/whitespace only
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Safely gets string value from unknown input
 *
 * @param value - Value to convert
 * @param defaultValue - Default if conversion fails
 * @returns String value
 */
export function toString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}
