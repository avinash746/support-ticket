import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets.js';
import TicketForm from '../components/TicketForm.jsx';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setServerErrors({});
    setFormError('');
    try {
      const ticket = await createTicket(values);
      navigate(`/tickets/${ticket.id}`, { state: { justCreated: true } });
    } catch (err) {
      setServerErrors(err.fieldErrors || {});
      setFormError(
        Object.keys(err.fieldErrors || {}).length ? 'Fix the highlighted fields and try again.' : err.message
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link to="/" className="text-sm font-medium text-brand-700 hover:underline">Back to tickets</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New ticket</h1>
      </div>
      <TicketForm onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} formError={formError} />
    </div>
  );
}
