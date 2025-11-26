/**
 * Central Export for All Constants
 *
 * Single entry point for importing constants throughout the application.
 */

export * from './paths';
export * from './messages';
export * from './styles';

/**
 * Configuration Constants
 */
export const CONFIG = {
  GITHUB: {
    API_BASE_URL: 'https://api.github.com',
    DEFAULT_BRANCH: 'main',
  },

  FILE: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },

  VALIDATION: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 200,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 5000,
  },
} as const;

/**
 * Content Types
 */
export enum ContentType {
  EVENTS = 'events',
  SCHOLARSHIPS = 'scholarships',
  STAFF = 'staff',
}
