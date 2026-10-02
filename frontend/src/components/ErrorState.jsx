export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div role="alert" className="card border-red-200 p-6 text-center">
      <h2 className="text-base font-semibold text-red-700">{title}</h2>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
