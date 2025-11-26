/**
 * Application Path Constants
 *
 * Centralized path management for content, uploads, and API routes.
 * Following Single Responsibility Principle - single source of truth for paths.
 */

export const PATHS = {
  // Content directories (relative to src/content/)
  CONTENT: {
    EVENTS: 'events',
    SCHOLARSHIPS: 'scholarships',
    STAFF: 'staff',
  },

  // Upload directories (relative to public/)
  UPLOADS: {
    BASE: '/uploads',
    EVENTS: '/uploads/events',
    STAFF: '/uploads/staff',
  },

  // Repository paths (for GitHub API)
  REPO: {
    CONTENT_BASE: 'src/content',
    PUBLIC_BASE: 'public',
    EVENTS: 'src/content/events',
    SCHOLARSHIPS: 'src/content/scholarships',
    STAFF: 'src/content/staff',
  },

  // Admin routes
  ADMIN: {
    BASE: '/admin',
    EVENTS: '/admin',
    SCHOLARSHIPS: '/admin/scholarships',
  },

  // API routes
  API: {
    EVENTS: {
      BASE: '/api/events',
      CREATE: '/api/events/create',
      EDIT: '/api/events/edit',
      DELETE: '/api/events/delete',
    },
    SCHOLARSHIPS: {
      BASE: '/api/scholarships',
      CREATE: '/api/scholarships/create',
      EDIT: '/api/scholarships/edit',
      DELETE: '/api/scholarships/delete',
    },
  },
} as const;

/**
 * Helper functions for path construction
 */

export function getEventContentPath(slug: string): string {
  return `${PATHS.REPO.EVENTS}/${slug}.md`;
}

export function getScholarshipContentPath(slug: string): string {
  return `${PATHS.REPO.SCHOLARSHIPS}/${slug}.md`;
}

export function getEventUploadPath(slug: string, filename: string): string {
  return `${PATHS.UPLOADS.EVENTS}/${slug}/${filename}`;
}

export function getEventUploadDir(slug: string): string {
  return `${PATHS.UPLOADS.EVENTS}/${slug}`;
}

export function getEventRepoImagePath(slug: string, filename: string): string {
  return `${PATHS.REPO.PUBLIC_BASE}${PATHS.UPLOADS.EVENTS}/${slug}/${filename}`;
}

export function getEventRepoImageDir(slug: string): string {
  return `${PATHS.REPO.PUBLIC_BASE}${PATHS.UPLOADS.EVENTS}/${slug}`;
}
