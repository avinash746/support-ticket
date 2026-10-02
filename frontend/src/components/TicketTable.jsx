import { Link, useLocation } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from './Badges.jsx';
import { formatDate } from '../utils/format.js';

/** Table from md and up, stacked cards on phones. */
export default function TicketTable({ tickets }) {
  const { search } = useLocation();
  const linkProps = (id) => ({ to: `/tickets/${id}`, state: { from: search } }); // lets "Back" restore filters

  return (
    <>
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Ticket</th>
              <th scope="col" className="px-4 py-3 font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Priority</th>
              <th scope="col" className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="max-w-xs px-4 py-3">
                  <Link {...linkProps(t.id)} className="block truncate font-semibold text-brand-700 hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.customerEmail}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {tickets.map((t) => (
          <li key={t.id} className="card p-4">
            <Link {...linkProps(t.id)} className="block font-semibold text-brand-700 hover:underline">
              {t.title}
            </Link>
            <p className="mt-1 break-all text-sm text-slate-600">{t.customerEmail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
              <span className="text-xs text-slate-500">{formatDate(t.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
