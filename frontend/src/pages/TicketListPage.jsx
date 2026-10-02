import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchStats, fetchTickets } from '../api/tickets.js';
import { PAGE_SIZE } from '../constants.js';
import useDebounce from '../hooks/useDebounce.js';
import SummaryCards from '../components/SummaryCards.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Filters, sort and page live in the URL (?status=Open&page=2) so a refresh,
 * the back button, or a shared link restores the exact view.
 * All filtering/sorting/paging itself happens on the backend.
 */
export default function TicketListPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const priority = params.get('priority') || '';
  const sort = params.get('sort') || 'newest';
  const search = params.get('search') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput);

  const [list, setList] = useState({ tickets: [], pagination: null });
  const [listState, setListState] = useState({ loading: true, error: null });
  const [stats, setStats] = useState(null);
  const [statsState, setStatsState] = useState({ loading: true, error: false });

  const updateParams = useCallback(
    (changes, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // Push the debounced search term into the URL
  useEffect(() => {
    if (debouncedSearch.trim() !== search) updateParams({ search: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Ticket list: refetch whenever the URL query changes
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setListState({ loading: true, error: null });
    fetchTickets({ search, status, priority, sort, page, limit: PAGE_SIZE }, controller.signal)
      .then((res) => {
        setList({ tickets: res.data, pagination: res.pagination });
        setListState({ loading: false, error: null });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setListState({ loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [search, status, priority, sort, page, reloadKey]);

  // Summary counts: whole dataset, independent of filters
  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal)
      .then((data) => {
        setStats(data);
        setStatsState({ loading: false, error: false });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setStatsState({ loading: false, error: true });
      });
    return () => controller.abort();
  }, [reloadKey]);

  // If the last item of the last page disappears, jump to the new last page
  useEffect(() => {
    const totalPages = list.pagination?.totalPages;
    if (totalPages && page > totalPages) updateParams({ page: String(totalPages) }, { resetPage: false });
  }, [list.pagination, page, updateParams]);

  const hasFilters = Boolean(search || status || priority || sort !== 'newest');
  const resetFilters = () => {
    setSearchInput('');
    setParams({}, { replace: true });
  };

  const { tickets, pagination } = list;
  const showEmpty = !listState.loading && !listState.error && tickets.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
      </div>

      <SummaryCards
        stats={stats}
        loading={statsState.loading}
        error={statsState.error}
        activeStatus={status}
        onSelect={(s) => updateParams({ status: s })}
      />

      <TicketFilters
        search={searchInput}
        status={status}
        priority={priority}
        sort={sort}
        hasFilters={hasFilters || Boolean(searchInput)}
        onSearchChange={setSearchInput}
        onChange={(changes) => updateParams(changes)}
        onReset={resetFilters}
      />

      {listState.error ? (
        <ErrorState title="Could not load tickets" message={listState.error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : listState.loading && tickets.length === 0 ? (
        <Spinner label="Loading tickets..." />
      ) : showEmpty ? (
        hasFilters ? (
          <EmptyState
            title="No tickets match your filters"
            message="Try a different search term or clear the filters."
            action={<button type="button" onClick={resetFilters} className="btn-secondary">Clear filters</button>}
          />
        ) : (
          <EmptyState
            title="No tickets yet"
            message="Create the first ticket to start tracking support requests."
            action={<Link to="/tickets/new" className="btn-primary">New ticket</Link>}
          />
        )
      ) : (
        <div className={`space-y-4 transition-opacity ${listState.loading ? 'opacity-60' : ''}`} aria-busy={listState.loading}>
          <TicketTable tickets={tickets} />
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => updateParams({ page: p > 1 ? String(p) : '' }, { resetPage: false })}
            />
          )}
        </div>
      )}
    </div>
  );
}
