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

  PAGINATION: {
    ITEMS_PER_PAGE: 9,
    DESCRIPTION_PREVIEW_LENGTH: 150,
  },

  TYPE_BADGES: {
    scholarship: 'bg-blue-600',
    fellowship: 'bg-green-600',
    internship: 'bg-purple-600',
  },

  DEFAULTS: {
    EVENT_IMAGE: '/uploads/events/ANS-badge-red.png',
  },

  CALENDAR: {
    // webcal:// for subscribe button (opens in calendar apps)
    SUBSCRIBE_URL: 'webcal://outlook.office365.com/owa/calendar/a03e210e1d5d4e8995a366910fb0f6a4@osu.edu/283b8d7c75834dfa890b4869d89f88fa4762600544675312803/calendar.ics',
    // https:// for server-side fetching
    FETCH_URL: 'https://outlook.office365.com/owa/calendar/a03e210e1d5d4e8995a366910fb0f6a4@osu.edu/283b8d7c75834dfa890b4869d89f88fa4762600544675312803/calendar.ics',
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
