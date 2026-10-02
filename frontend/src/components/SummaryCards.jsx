const ITEMS = [
  { key: 'total', label: 'Total tickets', status: '' },
  { key: 'open', label: 'Open', status: 'Open' },
  { key: 'inProgress', label: 'In Progress', status: 'In Progress' },
  { key: 'resolved', label: 'Resolved', status: 'Resolved' },
];

/** Counts always describe the whole dataset; clicking a card is a shortcut for the status filter. */
export default function SummaryCards({ stats, loading, error, activeStatus, onSelect }) {
  return (
    <section aria-label="Ticket summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map(({ key, label, status }) => {
        const active = activeStatus === status;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(status)}
            aria-pressed={active}
            className={`card px-4 py-3 text-left transition-colors hover:border-brand-600 ${
              active ? 'border-brand-600 bg-brand-50' : ''
            }`}
          >
            <span className="block text-sm text-slate-600">{label}</span>
            <span className="mt-1 block text-2xl font-bold tabular-nums">
              {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-200" /> : error ? '-' : stats?.[key] ?? 0}
            </span>
          </button>
        );
      })}
    </section>
  );
}
