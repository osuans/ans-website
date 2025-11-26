/**
 * Path Manipulation Utilities
 *
 * Centralized path extraction and manipulation functions.
 * Previously duplicated across events API routes.
 *
 * @module pathHelpers
 */

/**
 * Extracts the image folder path from a full image URL
 *
 * Converts: "/uploads/events/slug/file.jpg"
 * To: "uploads/events/slug"
 *
 * @param imageUrl - Full image URL path
 * @returns Directory path without leading slash
 *
 * @example
 * ```ts
 * extractImageFolder('/uploads/events/annual-meeting/photo.jpg')
 * // => 'uploads/events/annual-meeting'
 * ```
 */
export function extractImageFolder(imageUrl: string): string {
  const parts = imageUrl.split('/');
  return parts.slice(1, -1).join('/');
}

/**
 * Extracts the repository image folder from a URL
 *
 * Converts: "/uploads/events/slug/file.jpg"
 * To: "public/uploads/events/slug"
 *
 * @param imageUrl - Full image URL path
 * @returns Repository path with 'public' prefix
 */
export function extractRepoImageFolder(imageUrl: string): string {
  // from "/uploads/events/slug/file.jpg" → "public/uploads/events/slug"
  return `public${imageUrl.substring(0, imageUrl.lastIndexOf('/'))}`;
}

/**
 * Extracts filename from a path
 *
 * @param path - File path
 * @returns Filename with extension
 *
 * @example
 * ```ts
 * extractFilename('/uploads/events/slug/photo.jpg') // => 'photo.jpg'
 * ```
 */
export function extractFilename(path: string): string {
  return path.split('/').pop() || '';
}

/**
 * Extracts file extension from a filename
 *
 * @param filename - Filename with or without path
 * @returns File extension without dot
 *
 * @example
 * ```ts
 * extractExtension('photo.jpg') // => 'jpg'
 * extractExtension('/path/to/image.png') // => 'png'
 * ```
 */
export function extractExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Generates a unique filename with timestamp
 *
 * @param prefix - Filename prefix (e.g., 'event', 'staff')
 * @param extension - File extension without dot
 * @returns Unique filename
 *
 * @example
 * ```ts
 * generateUniqueFilename('event', 'jpg') // => 'event-1234567890.jpg'
 * ```
 */
export function generateUniqueFilename(prefix: string, extension: string): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Joins path segments safely
 *
 * @param segments - Path segments to join
 * @returns Joined path
 */
export function joinPath(...segments: string[]): string {
  return segments.filter(Boolean).join('/');
}

/**
 * Normalizes a path by removing duplicate slashes and trailing slashes
 *
 * @param path - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  return path
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/\/$/, ''); // Remove trailing slash
}
