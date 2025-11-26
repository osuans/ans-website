/**
 * Application Messages Constants
 *
 * Centralized error messages, success messages, and user-facing text.
 * Following DRY principle and making text changes easier.
 */

export const ERROR_MESSAGES = {
  // Validation errors
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_SLUG: 'Title must contain valid characters to generate a slug',
  INVALID_IMAGE_TYPE: 'Uploaded file must be an image',
  EMPTY_IMAGE_FILE: 'Image file cannot be empty',
  MISSING_SLUG: 'Missing slug parameter',

  // Not found errors
  EVENT_NOT_FOUND: 'Event not found',
  SCHOLARSHIP_NOT_FOUND: 'Scholarship not found',
  FILE_NOT_FOUND: 'File not found',

  // GitHub errors
  GITHUB_CREDENTIALS_MISSING: 'GitHub credentials missing. Skipping commit.',
  GITHUB_COMMIT_FAILED: 'Failed to commit file to GitHub',
  GITHUB_DELETE_FAILED: 'Failed to delete file from GitHub',
  GITHUB_FETCH_FAILED: 'Failed to fetch file from GitHub',

  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully',
  SCHOLARSHIP_CREATED: 'Scholarship created successfully',
  SCHOLARSHIP_UPDATED: 'Scholarship updated successfully',
  SCHOLARSHIP_DELETED: 'Scholarship deleted successfully',
} as const;

export const LOG_MESSAGES = {
  COMMITTING_TO: 'Committing to:',
  FILE_NOT_FOUND_ON_GITHUB: 'File not found on GitHub:',
  COULD_NOT_DELETE_FOLDER: 'Could not delete folder. It might not be empty or already gone.',
} as const;

export const COMMIT_MESSAGES = {
  CREATE: (contentType: string, path: string) => `chore(${contentType}): create ${path}`,
  UPDATE: (contentType: string, path: string) => `chore(${contentType}): update ${path}`,
  DELETE: (contentType: string, path: string) => `chore(${contentType}): delete ${path}`,
} as const;
