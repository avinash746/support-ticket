export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold">{from}-{to}</span> of <span className="font-semibold">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span className="px-2 text-sm text-slate-600" aria-current="page">
          Page {page} of {totalPages}
        </span>
        <button type="button" className="btn-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}
