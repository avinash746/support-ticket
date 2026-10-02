import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import TicketListPage from './pages/TicketListPage.jsx';
import CreateTicketPage from './pages/CreateTicketPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TicketListPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
