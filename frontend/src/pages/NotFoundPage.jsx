import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      message="The page you are looking for does not exist."
      action={<Link to="/" className="btn-primary">Go to tickets</Link>}
    />
  );
}
