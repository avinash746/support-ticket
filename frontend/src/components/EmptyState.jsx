export default function EmptyState({ title, message, action }) {
  return (
    <div className="card p-10 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
