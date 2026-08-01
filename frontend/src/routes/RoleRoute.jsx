import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute içinde (authenticate edilmiş kullanıcılar için) kullanılır.
 * @param {{ allow: string[] }} props - erişime izin verilen roller
 */
const RoleRoute = ({ allow }) => {
  const { user } = useAuth();

  if (!allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
