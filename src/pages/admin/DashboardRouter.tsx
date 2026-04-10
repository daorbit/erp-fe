import { lazy } from 'react';
import { Skeleton } from 'antd';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const PlatformDashboard = lazy(() => import('./PlatformDashboard'));
const CompanyDashboard = lazy(() => import('./Dashboard'));

const DashboardRouter: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <div className="p-6"><Skeleton active paragraph={{ rows: 6 }} /></div>;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return <PlatformDashboard />;
  }

  return <CompanyDashboard />;
};

export default DashboardRouter;
