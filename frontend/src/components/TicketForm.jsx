import { useState } from 'react';
import { PRIORITIES, STATUSES, TITLE_MAX } from '../constants.js';
import { validateTicketForm } from '../utils/validation.js';

const INITIAL = { title: '', description: '', customerEmail: '', priority: 'Medium', status: 'Open' };

/**
 * Create-ticket form. Validates on the client first, then shows any
 * field errors the API sends back (`serverErrors`).
 */
export default function TicketForm({ onSubmit, submitting, serverErrors = {}, formError }) {
  const [values, setValues] = useState(INITIAL);
  const [clientErrors, setClientErrors] = useState({});
  const errors = { ...serverErrors, ...clientErrors };

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (clientErrors[name]) setClientErrors((c) => ({ ...c, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateTicketForm(values);
    setClientErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...values, title: values.title.trim(), description: values.description.trim(), customerEmail: values.customerEmail.trim() });
    }
  };

  const inputClass = (name) => `field-input ${errors[name] ? 'field-input-error' : ''}`;
  const describedBy = (name) => (errors[name] ? `${name}-error` : undefined);
  const FieldError = ({ name }) =>
    errors[name] ? <p id={`${name}-error`} className="field-error">{errors[name]}</p> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-5 sm:p-6">
      {formError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="title" className="field-label">Title</label>
          <span className={`text-xs ${values.title.length > TITLE_MAX ? 'text-red-600' : 'text-slate-500'}`}>
            {values.title.length}/{TITLE_MAX}
          </span>
        </div>
        <input id="title" value={values.title} onChange={set('title')} className={inputClass('title')} aria-invalid={!!errors.title} aria-describedby={describedBy('title')} placeholder="Short summary of the problem" />
        <FieldError name="title" />
      </div>

      <div>
        <label htmlFor="description" className="field-label">Description</label>
        <textarea id="description" rows={5} value={values.description} onChange={set('description')} className={inputClass('description')} aria-invalid={!!errors.description} aria-describedby={describedBy('description')} placeholder="What happened, and what has the customer already tried?" />
        <FieldError name="description" />
      </div>

      <div>
        <label htmlFor="customerEmail" className="field-label">Customer email</label>
        <input id="customerEmail" type="email" value={values.customerEmail} onChange={set('customerEmail')} className={inputClass('customerEmail')} aria-invalid={!!errors.customerEmail} aria-describedby={describedBy('customerEmail')} placeholder="name@company.com" />
        <FieldError name="customerEmail" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="field-label">Priority</label>
          <select id="priority" value={values.priority} onChange={set('priority')} className={inputClass('priority')}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <FieldError name="priority" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" value={values.status} onChange={set('status')} className={inputClass('status')}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <FieldError name="status" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create ticket'}
        </button>
      </div>
    </form>
  );
}
