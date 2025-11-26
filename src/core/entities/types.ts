/**
 * Core Domain Types
 *
 * Shared types and interfaces for domain entities.
 * Following Domain-Driven Design principles.
 *
 * @module core/entities/types
 */

/**
 * Base entity interface
 */
export interface Entity {
  readonly id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Content metadata shared across all content types
 */
export interface ContentMetadata {
  slug: string;
  draft?: boolean;
  order?: number;
}

/**
 * File upload information
 */
export interface FileUpload {
  file: File;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Creates a success result
 */
export function success<T>(value: T): Result<T> {
  return { success: true, value };
}

/**
 * Creates a failure result
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success === true;
}

/**
 * Type guard to check if result is failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}
