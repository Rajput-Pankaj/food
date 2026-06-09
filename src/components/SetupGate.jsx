import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USE_API } from '../config/api';

const SETUP_ALLOWED = ['/setup', '/login', '/signup', '/forgot-password', '/reset-password'];

export default function SetupGate({ children }) {
  const { loading, needsSetup } = useAuth();
  const location = useLocation();

  if (!USE_API) return children;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  if (needsSetup && !SETUP_ALLOWED.includes(location.pathname)) {
    return <Navigate to="/setup" replace />;
  }
  if (!needsSetup && location.pathname === '/setup') {
    return <Navigate to="/login" replace />;
  }
  return children;
}
