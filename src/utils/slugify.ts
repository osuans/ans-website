/**
 * Slug Generation Utility
 *
 * Centralized slug creation to eliminate duplication across API routes.
 * Previously duplicated 4 times across events and scholarships APIs.
 *
 * @module slugify
 */

/**
 * Creates a URL-friendly slug from a title string
 *
 * Transformation process:
 * 1. Convert to lowercase
 * 2. Trim whitespace
 * 3. Remove special characters (keep alphanumeric, spaces, hyphens)
 * 4. Replace spaces/underscores with hyphens
 * 5. Remove leading/trailing hyphens
 *
 * @param title - The title string to convert
 * @returns URL-safe slug string
 *
 * @example
 * ```ts
 * slugify('Hello World!') // => 'hello-world'
 * slugify('  ANS Annual Meeting 2024  ') // => 'ans-annual-meeting-2024'
 * slugify('C++ Programming') // => 'c-programming'
 * ```
 */
export function slugify(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }

  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates that a slug is not empty
 *
 * @param slug - The slug to validate
 * @returns true if slug is valid (non-empty)
 */
export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && /^[a-z0-9-]+$/.test(slug);
}

/**
 * Creates a unique slug by appending a timestamp if needed
 *
 * @param title - The title to slugify
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function createUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let slug = slugify(title);

  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  // Append timestamp to make unique
  const timestamp = Date.now();
  slug = `${slug}-${timestamp}`;

  return slug;
}
