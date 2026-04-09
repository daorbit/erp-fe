import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getInitials, formatDate } from '@/lib/formatters';

// ----- Types -----

interface OnboardingRecord {
  key: string;
  name: string;
  email: string;
  department: string;
  startDate: string;
  kycStatus: string;
  kycProgress: number;
  step: string;
}

// ----- Mock Data -----

const data: OnboardingRecord[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', startDate: '2024-04-01', kycStatus: 'In Progress', kycProgress: 60, step: 'Bank Details' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', startDate: '2024-03-25', kycStatus: 'Completed', kycProgress: 100, step: 'Done' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', startDate: '2024-04-05', kycStatus: 'Pending', kycProgress: 0, step: 'Not Started' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', startDate: '2024-03-28', kycStatus: 'In Progress', kycProgress: 80, step: 'Documents' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', startDate: '2024-04-02', kycStatus: 'Rejected', kycProgress: 45, step: 'ID Verification' },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', department: 'Engineering', startDate: '2024-03-30', kycStatus: 'In Progress', kycProgress: 30, step: 'Personal Info' },
];

// ----- Component -----

const OnboardingList: React.FC = () => {
  const navigate = useNavigate();

  const columns: ColumnDef<OnboardingRecord>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.original.department}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: 'step',
      header: 'Current Step',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.step}</span>
      ),
    },
    {
      accessorKey: 'kycStatus',
      header: 'KYC Status',
      cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
    },
    {
      accessorKey: 'kycProgress',
      header: 'Progress',
      cell: ({ row }) => {
        const val = row.original.kycProgress;
        return (
          <div className="flex items-center gap-2 w-[130px]">
            <Progress
              value={val}
              className="h-2 flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{val}%</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: () => (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-blue-600"
          onClick={() => navigate('/onboarding/details')}
        >
          <Eye className="mr-1 h-3.5 w-3.5" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding List"
        description="Track all employee onboarding progress"
        actions={
          <Button onClick={() => navigate('/onboarding/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Onboarding
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search employees..."
        onSearchChange={() => {}}
      />
    </div>
  );
};

export default OnboardingList;
