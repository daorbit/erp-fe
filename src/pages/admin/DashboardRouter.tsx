import React, { lazy } from 'react';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const PlatformDashboard = lazy(() => import('./PlatformDashboard'));
const CompanyDashboard = lazy(() => import('./Dashboard'));

const DashboardRouter: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role === UserRole.SUPER_ADMIN) {
    return <PlatformDashboard />;
  }

  return <CompanyDashboard />;
};

export default DashboardRouter;
