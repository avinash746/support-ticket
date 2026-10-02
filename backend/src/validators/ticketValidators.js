const { z } = require('zod');
const { STATUSES, PRIORITIES } = require('../models/constants');

const requiredText = (label) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim()
    .min(1, `${label} is required`);

const enumOf = (label, values) =>
  z.enum(values, {
    errorMap: () => ({ message: `${label} must be one of: ${values.join(', ')}` }),
  });

// Query strings send "" for untouched inputs - treat that as "not provided"
const emptyToUndefined = (v) => (v === '' ? undefined : v);

const createTicketSchema = z.object({
  title: requiredText('Title').max(120, 'Title must be 120 characters or fewer'),
  description: requiredText('Description'),
  customerEmail: requiredText('Customer email')
    .toLowerCase()
    .email('Customer email must be a valid email address'),
  priority: enumOf('Priority', PRIORITIES).default('Medium'),
  status: enumOf('Status', STATUSES).default('Open'),
});

// Only status and priority may change after creation
const updateTicketSchema = z
  .object({
    status: enumOf('Status', STATUSES).optional(),
    priority: enumOf('Priority', PRIORITIES).optional(),
  })
  .strict('Only status and priority can be updated')
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one of: status, priority',
  });

const listQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  status: z.preprocess(emptyToUndefined, enumOf('Status', STATUSES).optional()),
  priority: z.preprocess(emptyToUndefined, enumOf('Priority', PRIORITIES).optional()),
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(['newest', 'oldest'], { errorMap: () => ({ message: 'Sort must be newest or oldest' }) }).default('newest')
  ),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number({ invalid_type_error: 'Page must be a number' }).int().min(1, 'Page must be 1 or greater').default(1)
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number({ invalid_type_error: 'Limit must be a number' }).int().min(1).max(50, 'Limit must be 50 or fewer').default(10)
  ),
});

module.exports = { createTicketSchema, updateTicketSchema, listQuerySchema };
