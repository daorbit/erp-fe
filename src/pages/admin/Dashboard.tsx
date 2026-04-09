import React from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getInitials } from '@/lib/formatters';
import { useDashboardStats, useRecentActivities } from '@/hooks/queries/useDashboard';

/* ---------- Mock Data ---------- */

interface OnboardingRecord {
  key: string;
  name: string;
  email: string;
  department: string;
  status: string;
  progress: number;
}

const recentOnboarding: OnboardingRecord[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', status: 'In Progress', progress: 60 },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', status: 'Completed', progress: 100 },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', status: 'Pending', progress: 20 },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', status: 'In Progress', progress: 75 },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', status: 'Completed', progress: 100 },
];

const activities = [
  { title: 'Rahul Sharma uploaded Aadhaar card', time: '2 min ago', icon: <ShieldCheck className="h-4 w-4 text-blue-600" />, initials: 'RS', color: 'bg-blue-100 text-blue-700' },
  { title: 'Priya Singh completed onboarding', time: '15 min ago', icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, initials: 'PS', color: 'bg-green-100 text-green-700' },
  { title: 'Amit Patel started KYC process', time: '1 hour ago', icon: <UserPlus className="h-4 w-4 text-amber-600" />, initials: 'AP', color: 'bg-amber-100 text-amber-700' },
  { title: 'Sneha Gupta submitted bank details', time: '3 hours ago', icon: <ShieldCheck className="h-4 w-4 text-blue-600" />, initials: 'SG', color: 'bg-blue-100 text-blue-700' },
];

/* ---------- Stats ---------- */

const stats = [
  {
    title: 'Total Employees',
    value: 248,
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    change: '+12% from last month',
  },
  {
    title: 'Pending Onboarding',
    value: 15,
    icon: <UserPlus className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    change: '+3 from last month',
  },
  {
    title: 'KYC Completed',
    value: 230,
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    change: '93% completion rate',
  },
  {
    title: 'Pending Approvals',
    value: 8,
    icon: <Clock3 className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    change: '-2 from last month',
  },
];

/* ---------- Table Columns ---------- */

const columns: ColumnDef<OnboardingRecord, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Employee',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
        {row.original.department}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'progress',
    header: 'KYC Progress',
    cell: ({ row }) => {
      const val = row.original.progress;
      return (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={val} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-9 text-right">{val}%</span>
        </div>
      );
    },
  },
];

/* ---------- Component ---------- */

const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities();

  const dashboardStats = statsData?.data;
  const apiStats = dashboardStats ? [
    {
      title: 'Total Employees',
      value: dashboardStats.totalEmployees ?? 248,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: dashboardStats.employeeChange ?? '+12% from last month',
    },
    {
      title: 'Pending Onboarding',
      value: dashboardStats.pendingOnboarding ?? 15,
      icon: <UserPlus className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      change: dashboardStats.onboardingChange ?? '+3 from last month',
    },
    {
      title: 'KYC Completed',
      value: dashboardStats.kycCompleted ?? 230,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: dashboardStats.kycRate ?? '93% completion rate',
    },
    {
      title: 'Pending Approvals',
      value: dashboardStats.pendingApprovals ?? 8,
      icon: <Clock3 className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: dashboardStats.approvalChange ?? '-2 from last month',
    },
  ] : stats;

  const recentActivities = activitiesData?.data ?? activities;

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        description="Welcome back, Admin. Here's what's happening today."
      />

      {/* KPI Stats */}
      <StatsGrid stats={apiStats} />

      {/* Main Content: Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Onboarding Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={recentOnboarding} />
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentActivities.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-muted text-xs">
                        {activity.icon}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
