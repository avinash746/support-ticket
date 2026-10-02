import { describe, expect, it } from 'vitest';
import { validateTicketForm } from './validation.js';

const valid = {
  title: 'Login broken',
  description: 'Cannot sign in',
  customerEmail: 'a@b.co',
  priority: 'Low',
  status: 'Open',
};

describe('validateTicketForm', () => {
  it('accepts a valid ticket', () => {
    expect(validateTicketForm(valid)).toEqual({});
  });

  it('requires title, description and email (whitespace does not count)', () => {
    const errors = validateTicketForm({ ...valid, title: '  ', description: '', customerEmail: '' });
    expect(Object.keys(errors)).toEqual(['title', 'description', 'customerEmail']);
  });

  it('enforces the 120 character title limit', () => {
    expect(validateTicketForm({ ...valid, title: 'x'.repeat(120) }).title).toBeUndefined();
    expect(validateTicketForm({ ...valid, title: 'x'.repeat(121) }).title).toMatch(/120/);
  });

  it('rejects malformed emails', () => {
    ['plain', 'a@b', 'a b@c.com', '@c.com'].forEach((customerEmail) => {
      expect(validateTicketForm({ ...valid, customerEmail }).customerEmail).toBeDefined();
    });
  });
});
