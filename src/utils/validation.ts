import { z } from 'zod';

export const uuidSchema = z
  .string()
  .uuid('Must be a valid UUID format (e.g., 550e8400-e29b-41d4-a716-446655440000)');

export const createVisitSchema = z.object({
  user_id: uuidSchema,
  restaurant_id: uuidSchema,
  competition_id: uuidSchema,
  geo_lat: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .refine(
      (val) => !(val === 0),
      'GPS coordinates (0, 0) are invalid — your device may not have a GPS fix'
    ),
  geo_lng: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  referral_code_used: z
    .string()
    .max(20, 'Referral code cannot exceed 20 characters')
    .optional()
    .nullable(),
});

export const createReviewSchema = z.object({
  visit_id: uuidSchema,
  user_id: uuidSchema,
  restaurant_id: uuidSchema,
  taste_rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  value_rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  vibe_rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  wow_rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .max(2000, 'Review comment cannot exceed 2,000 characters')
    .optional()
    .nullable(),
  would_return: z.boolean({
    required_error: 'The "would you return?" field is required',
  }),
});

export function formatZodError(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}
