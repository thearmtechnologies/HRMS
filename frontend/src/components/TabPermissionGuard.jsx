import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Unauthorized from "../pages/Unauthorized";

export default function TabPermissionGuard({ moduleName, action = 'view', children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user || !user.permissions) {
    return <Unauthorized />;
  }

  // If moduleName is not provided, it means this tab is public to authenticated users
  if (!moduleName) {
    return children;
  }

  // Find module permission
  const perm = user.permissions.find(p => p.module === moduleName);

  if (perm && perm[action] === true) {
    return children;
  }

  return <Unauthorized />;
}
