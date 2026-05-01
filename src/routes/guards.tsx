import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user?.passwordChangeRequired && location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" replace />;
  }

  // If onboarding is pending, redirect to onboarding (admin & HR are exempt)
  const onboardingExempt = ['super_admin', 'admin', 'hr_manager'];
  if (
    user &&
    user.onboardingRequired &&
    !user.onboardingCompleted &&
    !onboardingExempt.includes(user.role) &&
    location.pathname !== '/onboarding/new'
  ) {
    return <Navigate to="/onboarding/new" replace />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  if (isAuthenticated) return <Navigate to={user?.passwordChangeRequired ? '/force-password-change' : '/admin'} replace />;
  return <>{children}</>;
}

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
