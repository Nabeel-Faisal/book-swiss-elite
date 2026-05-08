import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BookingForm     from './pages/BookingForm';
import AdminLogin      from './pages/AdminLogin';
import AdminDashboard  from './pages/AdminDashboard';

function PrivateRoute({ children }) {
  try {
    const auth = JSON.parse(localStorage.getItem('se_auth') || '{}');
    if (auth.loggedIn) return children;
  } catch(e) {}
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<BookingForm />} />
        <Route path="/admin"               element={<AdminLogin />} />
        <Route path="/admin/login"         element={<AdminLogin />} />
        <Route path="/admin/dashboard"     element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/dashboard.html" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
