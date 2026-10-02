import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-ink">
            Support Desk
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-100 text-ink' : 'text-slate-600 hover:text-ink'}`
              }
            >
              Tickets
            </NavLink>
            <Link to="/tickets/new" className="btn-primary">
              New ticket
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
