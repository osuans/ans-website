/**
 * API Response Helpers
 *
 * Centralized HTTP response creation for consistent API responses.
 * Eliminates duplication of error response patterns across API routes.
 *
 * @module apiHelpers
 */

import type { APIRoute } from 'astro';
import { ERROR_MESSAGES } from '../constants';

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  timestamp?: string;
}

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * HTTP status codes enum
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Creates a standardized JSON error response
 *
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details
 * @returns Response object
 */
export function createErrorResponse(
  message: string,
  status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: unknown
): Response {
  const body: ApiErrorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    body.details = details;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a standardized JSON success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param message - Optional success message
 * @returns Response object
 */
export function createSuccessResponse<T>(
  data?: T,
  status: HttpStatus = HttpStatus.OK,
  message?: string
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    body.data = data;
  }

  if (message) {
    body.message = message;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a validation error response (400)
 */
export function createValidationError(message: string = ERROR_MESSAGES.MISSING_REQUIRED_FIELDS): Response {
  return createErrorResponse(message, HttpStatus.BAD_REQUEST);
}

/**
 * Creates a not found error response (404)
 */
export function createNotFoundError(message: string = ERROR_MESSAGES.FILE_NOT_FOUND): Response {
  return createErrorResponse(message, HttpStatus.NOT_FOUND);
}

/**
 * Creates an internal server error response (500)
 */
export function createServerError(message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR): Response {
  return createErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR);
}

/**
 * Creates a redirect response (303)
 */
export function createRedirect(url: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: url,
    },
  });
}

/**
 * Wraps an async API handler with error handling
 *
 * @param handler - API route handler function
 * @returns Wrapped handler with try-catch
 */
export function withErrorHandling(
  handler: (context: Parameters<APIRoute>[0]) => Promise<Response>
): APIRoute {
  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        return createServerError(error.message);
      }

      return createServerError();
    }
  };
}

/**
 * Parses form data with type safety
 *
 * @param formData - FormData object
 * @param schema - Expected fields and types
 * @returns Parsed data object
 */
export function parseFormData<T extends Record<string, unknown>>(
  formData: FormData,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'file'>
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, type] of Object.entries(schema)) {
    const value = formData.get(key);

    if (value === null) {
      continue;
    }

    switch (type) {
      case 'string':
        result[key as keyof T] = String(value) as T[keyof T];
        break;
      case 'number':
        result[key as keyof T] = Number(value) as T[keyof T];
        break;
      case 'boolean':
        result[key as keyof T] = (value === 'on' || value === 'true') as T[keyof T];
        break;
      case 'file':
        if (value instanceof File) {
          result[key as keyof T] = value as T[keyof T];
        }
        break;
    }
  }

  return result;
}

/**
 * Validates required fields are present
 *
 * @param data - Data object to validate
 * @param requiredFields - Array of required field names
 * @returns true if all required fields present, false otherwise
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every(field => {
    const value = data[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'number' && (isNaN(value) || value === 0)) return false;
    return true;
  });
}
