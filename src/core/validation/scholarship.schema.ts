/**
 * Scholarship Validation Schemas
 *
 * Zod schemas for validating scholarship input data.
 * Following Input Validation best practices and type safety.
 *
 * @module core/validation/scholarship.schema
 */

import { z } from 'zod';
import { CONFIG } from '../../constants';

/**
 * Schema for scholarship deadline validation
 */
const DeadlineDateSchema = z.coerce.date({
  required_error: 'Deadline is required',
  invalid_type_error: 'Invalid date format',
});

/**
 * Scholarship type enum
 */
const TypeEnum = z.enum(['scholarship', 'fellowship', 'internship'], {
  errorMap: () => ({ message: 'Type must be scholarship, fellowship, or internship' }),
});

/**
 * Scholarship frequency enum
 */
const FrequencyEnum = z.enum(['One-time', 'Annual', 'Semester', 'Monthly'], {
  errorMap: () => ({ message: 'Frequency must be One-time, Annual, Semester, or Monthly' }),
});

/**
 * Schema for creating a new scholarship
 */
export const CreateScholarshipSchema = z.object({
  name: z
    .string()
    .min(CONFIG.VALIDATION.MIN_TITLE_LENGTH, `Name must be at least ${CONFIG.VALIDATION.MIN_TITLE_LENGTH} characters`)
    .max(CONFIG.VALIDATION.MAX_TITLE_LENGTH, `Name must not exceed ${CONFIG.VALIDATION.MAX_TITLE_LENGTH} characters`)
    .trim(),

  type: TypeEnum,

  amount: z
    .number()
    .positive('Amount must be a positive number')
    .max(1000000, 'Amount seems unrealistically high')
    .or(
      z
        .string()
        .transform((val) => Number(val))
        .pipe(z.number().positive())
    ),

  frequency: FrequencyEnum,

  deadline: DeadlineDateSchema,

  description: z
    .string()
    .min(CONFIG.VALIDATION.MIN_DESCRIPTION_LENGTH, 'Description must be at least 10 characters')
    .max(CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH, 'Description must not exceed 5000 characters')
    .trim(),

  eligibility: z
    .string()
    .min(1, 'At least one eligibility criterion is required')
    .transform((val) => {
      // Split by newlines and filter out empty lines
      return val
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    })
    .pipe(z.array(z.string()).min(1, 'At least one eligibility criterion is required')),
});

/**
 * Schema for updating an existing scholarship
 */
export const UpdateScholarshipSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),

  name: z
    .string()
    .min(CONFIG.VALIDATION.MIN_TITLE_LENGTH)
    .max(CONFIG.VALIDATION.MAX_TITLE_LENGTH)
    .trim(),

  type: TypeEnum,

  amount: z
    .number()
    .positive('Amount must be a positive number')
    .max(1000000)
    .or(
      z
        .string()
        .transform((val) => Number(val))
        .pipe(z.number().positive())
    ),

  frequency: FrequencyEnum,

  deadline: DeadlineDateSchema,

  description: z
    .string()
    .min(CONFIG.VALIDATION.MIN_DESCRIPTION_LENGTH)
    .max(CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH)
    .trim(),

  eligibility: z
    .string()
    .min(1)
    .transform((val) => {
      return val
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    })
    .pipe(z.array(z.string()).min(1)),
});

/**
 * Schema for deleting a scholarship
 */
export const DeleteScholarshipSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

/**
 * Type inference from schemas
 */
export type CreateScholarshipInput = z.infer<typeof CreateScholarshipSchema>;
export type UpdateScholarshipInput = z.infer<typeof UpdateScholarshipSchema>;
export type DeleteScholarshipInput = z.infer<typeof DeleteScholarshipSchema>;
