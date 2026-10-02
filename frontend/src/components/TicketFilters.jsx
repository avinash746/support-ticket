import { PRIORITIES, STATUSES } from '../constants.js';

export default function TicketFilters({ search, status, priority, sort, onSearchChange, onChange, onReset, hasFilters }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="search" className="field-label">Search</label>
        <input
          id="search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Title or customer email"
          className="field-input"
        />
      </div>
      <Select id="status" label="Status" value={status} onChange={(v) => onChange({ status: v })} options={STATUSES} allLabel="All statuses" />
      <Select id="priority" label="Priority" value={priority} onChange={(v) => onChange({ priority: v })} options={PRIORITIES} allLabel="All priorities" />
      <div>
        <label htmlFor="sort" className="field-label">Sort by</label>
        <select id="sort" value={sort} onChange={(e) => onChange({ sort: e.target.value })} className="field-input">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      <button type="button" onClick={onReset} disabled={!hasFilters} className="btn-secondary">
        Clear filters
      </button>
    </form>
  );
}

function Select({ id, label, value, onChange, options, allLabel }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field-input">
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
