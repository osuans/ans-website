/**
 * Central Export for All Constants
 *
 * Single entry point for importing constants throughout the application.
 */

export * from './styles';

/**
 * Configuration Constants
 */
export const CONFIG = {
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
    EVENT_IMAGE: '/uploads/events/TheOhioStateUniversity.jpg',
  },

  CALENDAR: {
    // webcal:// for subscribe button (opens in calendar apps)
    SUBSCRIBE_URL: 'webcal://outlook.office365.com/owa/calendar/a03e210e1d5d4e8995a366910fb0f6a4@osu.edu/f3547be4b8f54c98835747db1883288915833422290451459545/calendar.ics',
    // https:// for server-side fetching
    FETCH_URL: 'https://outlook.office365.com/owa/calendar/a03e210e1d5d4e8995a366910fb0f6a4@osu.edu/f3547be4b8f54c98835747db1883288915833422290451459545/calendar.ics',
  },
} as const;
