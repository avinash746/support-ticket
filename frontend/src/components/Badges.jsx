const STATUS_STYLES = {
  Open: 'bg-amber-100 text-amber-800 ring-amber-200',
  'In Progress': 'bg-sky-100 text-sky-800 ring-sky-200',
  Resolved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
};

const PRIORITY_STYLES = {
  High: 'bg-red-100 text-red-800 ring-red-200',
  Medium: 'bg-slate-200 text-slate-800 ring-slate-300',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const base = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset';

export const StatusBadge = ({ status }) => (
  <span className={`${base} ${STATUS_STYLES[status] || ''}`}>{status}</span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`${base} ${PRIORITY_STYLES[priority] || ''}`}>{priority}</span>
);
