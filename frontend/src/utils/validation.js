import { PRIORITIES, STATUSES, TITLE_MAX } from '../constants.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors the backend rules so people get instant feedback.
 * Returns an object keyed by field name; empty object = valid.
 * The backend remains the source of truth.
 */
export function validateTicketForm(values) {
  const errors = {};
  const title = (values.title ?? '').trim();
  const description = (values.description ?? '').trim();
  const email = (values.customerEmail ?? '').trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length > TITLE_MAX) errors.title = `Title must be ${TITLE_MAX} characters or fewer`;

  if (!description) errors.description = 'Description is required';

  if (!email) errors.customerEmail = 'Customer email is required';
  else if (!EMAIL_RE.test(email)) errors.customerEmail = 'Enter a valid email address, like name@company.com';

  if (!PRIORITIES.includes(values.priority)) errors.priority = 'Choose a priority';
  if (!STATUSES.includes(values.status)) errors.status = 'Choose a status';

  return errors;
}
