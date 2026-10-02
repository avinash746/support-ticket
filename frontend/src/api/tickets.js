import { request } from './client.js';

/** params: { search, status, priority, sort, page, limit } - empty values are skipped */
export function fetchTickets(params, signal) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return request(`/tickets?${query.toString()}`, { signal });
}

export const fetchStats = (signal) => request('/tickets/stats', { signal }).then((r) => r.data);
export const fetchTicket = (id, signal) => request(`/tickets/${id}`, { signal }).then((r) => r.data);
export const createTicket = (body) => request('/tickets', { method: 'POST', body }).then((r) => r.data);
export const updateTicket = (id, body) =>
  request(`/tickets/${id}`, { method: 'PATCH', body }).then((r) => r.data);
