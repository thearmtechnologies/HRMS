import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, requiredModule, requiredAction = 'view' }) => {
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.isFirstLogin && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Legacy role check fallback (can be removed later)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // New Module-level permission check
  if (requiredModule) {
    const perm = user.permissions?.find(p => p.module === requiredModule);
    if (!perm || perm[requiredAction] !== true) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
