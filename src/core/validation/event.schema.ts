/**
 * Event Validation Schemas
 *
 * Zod schemas for validating event input data.
 * Following Input Validation best practices and type safety.
 *
 * @module core/validation/event.schema
 */

import { z } from 'zod';
import { CONFIG } from '../../constants';

/**
 * Schema for event date validation
 */
const EventDateSchema = z.coerce.date({
  required_error: 'Event date is required',
  invalid_type_error: 'Invalid date format',
});

/**
 * Schema for event image file validation
 */
export const EventImageSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'Image file cannot be empty')
  .refine(
    (file) => file.size <= CONFIG.FILE.MAX_IMAGE_SIZE,
    `Image must be smaller than ${CONFIG.FILE.MAX_IMAGE_SIZE / (1024 * 1024)}MB`
  )
  .refine(
    (file) => CONFIG.FILE.ALLOWED_IMAGE_TYPES.includes(file.type),
    `Image must be one of: ${CONFIG.FILE.ALLOWED_IMAGE_TYPES.join(', ')}`
  );

/**
 * Schema for creating a new event
 */
export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(CONFIG.VALIDATION.MIN_TITLE_LENGTH, `Title must be at least ${CONFIG.VALIDATION.MIN_TITLE_LENGTH} characters`)
    .max(CONFIG.VALIDATION.MAX_TITLE_LENGTH, `Title must not exceed ${CONFIG.VALIDATION.MAX_TITLE_LENGTH} characters`)
    .trim(),

  date: EventDateSchema,

  endDate: EventDateSchema.optional(),

  time: z.string().trim().optional(),

  location: z.string().min(1, 'Location is required').trim(),

  image: EventImageSchema.optional(),

  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary must not exceed 500 characters')
    .trim(),

  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((tag) => tag.trim()).filter(Boolean) : [])),

  registrationLink: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),

  registrationRequired: z.boolean().default(false),

  draft: z.boolean().default(false),

  body: z.string().optional().default(''),
}).refine(
  (data) => {
    // If endDate is provided, it must be after date
    if (data.endDate && data.date) {
      return data.endDate >= data.date;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Schema for updating an existing event
 */
export const UpdateEventSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),

  title: z
    .string()
    .min(CONFIG.VALIDATION.MIN_TITLE_LENGTH)
    .max(CONFIG.VALIDATION.MAX_TITLE_LENGTH)
    .trim(),

  date: EventDateSchema,

  endDate: EventDateSchema.optional(),

  time: z.string().trim().optional(),

  location: z.string().min(1, 'Location is required').trim(),

  image: EventImageSchema.optional(), // Optional for updates

  summary: z.string().min(10).max(500).trim(),

  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((tag) => tag.trim()).filter(Boolean) : [])),

  registrationLink: z.string().url().optional().or(z.literal('')),

  registrationRequired: z.boolean().default(false),

  draft: z.boolean().default(false),

  body: z.string().optional().default(''),
}).refine(
  (data) => {
    if (data.endDate && data.date) {
      return data.endDate >= data.date;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Schema for deleting an event
 */
export const DeleteEventSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

/**
 * Type inference from schemas
 */
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type DeleteEventInput = z.infer<typeof DeleteEventSchema>;
