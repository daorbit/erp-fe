import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
