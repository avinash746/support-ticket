import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchTicket, updateTicket } from '../api/tickets.js';
import { PRIORITIES, STATUSES } from '../constants.js';
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { formatDate } from '../utils/format.js';

export default function TicketDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [state, setState] = useState({ loading: true, error: null, notFound: false });
  const [draft, setDraft] = useState({ status: '', priority: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(location.state?.justCreated ? { type: 'success', text: 'Ticket created.' } : null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: null, notFound: false });
    fetchTicket(id, controller.signal)
      .then((data) => {
        setTicket(data);
        setDraft({ status: data.status, priority: data.priority });
        setState({ loading: false, error: null, notFound: false });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        const notFound = err.status === 404 || err.code === 'INVALID_ID';
        setState({ loading: false, error: err.message, notFound });
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  const backTo = `/${location.state?.from || ''}`;
  const dirty = ticket && (draft.status !== ticket.status || draft.priority !== ticket.priority);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const updated = await updateTicket(id, { status: draft.status, priority: draft.priority });
      setTicket(updated);
      setDraft({ status: updated.status, priority: updated.priority });
      setNotice({ type: 'success', text: 'Changes saved.' });
    } catch (err) {
      const fieldMessages = Object.values(err.fieldErrors || {}).join(' ');
      setNotice({ type: 'error', text: fieldMessages || err.message });
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <Spinner label="Loading ticket..." />;
  if (state.notFound)
    return (
      <ErrorState
        title="Ticket not found"
        message="It may have been removed, or the link is incorrect."
        onRetry={undefined}
      />
    );
  if (state.error) return <ErrorState title="Could not load ticket" message={state.error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link to={backTo} className="text-sm font-medium text-brand-700 hover:underline">Back to tickets</Link>
        <h1 className="mt-2 break-words text-2xl font-bold tracking-tight">{ticket.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-md border px-4 py-3 text-sm ${
            notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {notice.text}
        </div>
      )}

      <section className="card p-5 sm:p-6" aria-labelledby="details-heading">
        <h2 id="details-heading" className="sr-only">Ticket details</h2>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-slate-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words">{ticket.description}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Customer email</dt>
            <dd className="mt-1 break-all"><a href={`mailto:${ticket.customerEmail}`} className="text-brand-700 hover:underline">{ticket.customerEmail}</a></dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Ticket id</dt>
            <dd className="mt-1 break-all font-mono text-sm">{ticket.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Created</dt>
            <dd className="mt-1">{formatDate(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Last updated</dt>
            <dd className="mt-1">{formatDate(ticket.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={handleSave} className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-semibold">Update ticket</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="field-label">Status</label>
            <select id="status" className="field-input" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="field-label">Priority</label>
            <select id="priority" className="field-input" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={!dirty || saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
