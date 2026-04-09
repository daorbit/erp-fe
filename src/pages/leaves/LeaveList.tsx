import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  Check,
  X,
  Eye,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import type { StatsCardProps } from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getInitials } from '@/lib/formatters';
import {
  useLeaveList,
  useLeaveTypeList,
  useCreateLeaveType,
  useApproveLeave,
  useRejectLeave,
} from '@/hooks/queries/useLeaves';

// ----- Types -----

interface LeaveRequest {
  key: string;
  name: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: string;
  appliedOn: string;
}

interface LeaveType {
  key: string;
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  paid: boolean;
  applicableFor: string;
  status: string;
}

interface LeaveBalance {
  key: string;
  name: string;
  department: string;
  cl: { allocated: number; used: number; remaining: number };
  sl: { allocated: number; used: number; remaining: number };
  el: { allocated: number; used: number; remaining: number };
}

// ----- Mock Data -----

const leaveRequests: LeaveRequest[] = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', leaveType: 'Casual Leave', from: '10 Apr 2026', to: '11 Apr 2026', days: 2, reason: 'Personal work', status: 'pending', appliedOn: '05 Apr 2026' },
  { key: '2', name: 'Priya Singh', department: 'Marketing', leaveType: 'Sick Leave', from: '07 Apr 2026', to: '07 Apr 2026', days: 1, reason: 'Not feeling well', status: 'approved', appliedOn: '06 Apr 2026' },
  { key: '3', name: 'Amit Patel', department: 'Finance', leaveType: 'Earned Leave', from: '14 Apr 2026', to: '18 Apr 2026', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '03 Apr 2026' },
  { key: '4', name: 'Sneha Gupta', department: 'HR', leaveType: 'Casual Leave', from: '01 Apr 2026', to: '01 Apr 2026', days: 1, reason: 'Doctor appointment', status: 'approved', appliedOn: '30 Mar 2026' },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', leaveType: 'Comp Off', from: '08 Apr 2026', to: '08 Apr 2026', days: 1, reason: 'Worked on Saturday', status: 'approved', appliedOn: '06 Apr 2026' },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', leaveType: 'Sick Leave', from: '03 Apr 2026', to: '04 Apr 2026', days: 2, reason: 'Fever and cold', status: 'approved', appliedOn: '03 Apr 2026' },
  { key: '7', name: 'Karan Mehta', department: 'Sales', leaveType: 'Casual Leave', from: '20 Apr 2026', to: '22 Apr 2026', days: 3, reason: 'Wedding ceremony', status: 'pending', appliedOn: '07 Apr 2026' },
  { key: '8', name: 'Deepika Nair', department: 'Engineering', leaveType: 'Maternity Leave', from: '01 May 2026', to: '27 Oct 2026', days: 180, reason: 'Maternity', status: 'approved', appliedOn: '15 Mar 2026' },
  { key: '9', name: 'Rajesh Kumar', department: 'Finance', leaveType: 'Earned Leave', from: '25 Apr 2026', to: '30 Apr 2026', days: 4, reason: 'Hometown visit', status: 'rejected', appliedOn: '04 Apr 2026' },
  { key: '10', name: 'Meera Iyer', department: 'Marketing', leaveType: 'Loss of Pay', from: '12 Apr 2026', to: '12 Apr 2026', days: 1, reason: 'Personal emergency', status: 'pending', appliedOn: '08 Apr 2026' },
  { key: '11', name: 'Suresh Pillai', department: 'HR', leaveType: 'Paternity Leave', from: '15 Apr 2026', to: '29 Apr 2026', days: 15, reason: 'Paternity', status: 'approved', appliedOn: '01 Apr 2026' },
];

const leaveTypes: LeaveType[] = [
  { key: '1', name: 'Casual Leave', code: 'CL', defaultDays: 12, carryForward: false, paid: true, applicableFor: 'all', status: 'Active' },
  { key: '2', name: 'Sick Leave', code: 'SL', defaultDays: 8, carryForward: false, paid: true, applicableFor: 'all', status: 'Active' },
  { key: '3', name: 'Earned Leave', code: 'EL', defaultDays: 15, carryForward: true, paid: true, applicableFor: 'all', status: 'Active' },
  { key: '4', name: 'Maternity Leave', code: 'ML', defaultDays: 180, carryForward: false, paid: true, applicableFor: 'female', status: 'Active' },
  { key: '5', name: 'Paternity Leave', code: 'PL', defaultDays: 15, carryForward: false, paid: true, applicableFor: 'male', status: 'Active' },
  { key: '6', name: 'Comp Off', code: 'CO', defaultDays: 0, carryForward: false, paid: true, applicableFor: 'all', status: 'Active' },
  { key: '7', name: 'Loss of Pay', code: 'LOP', defaultDays: 0, carryForward: false, paid: false, applicableFor: 'all', status: 'Active' },
];

const leaveBalances: LeaveBalance[] = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', cl: { allocated: 12, used: 3, remaining: 9 }, sl: { allocated: 8, used: 1, remaining: 7 }, el: { allocated: 15, used: 5, remaining: 10 } },
  { key: '2', name: 'Priya Singh', department: 'Marketing', cl: { allocated: 12, used: 5, remaining: 7 }, sl: { allocated: 8, used: 2, remaining: 6 }, el: { allocated: 15, used: 0, remaining: 15 } },
  { key: '3', name: 'Amit Patel', department: 'Finance', cl: { allocated: 12, used: 2, remaining: 10 }, sl: { allocated: 8, used: 0, remaining: 8 }, el: { allocated: 15, used: 8, remaining: 7 } },
  { key: '4', name: 'Sneha Gupta', department: 'HR', cl: { allocated: 12, used: 4, remaining: 8 }, sl: { allocated: 8, used: 3, remaining: 5 }, el: { allocated: 15, used: 2, remaining: 13 } },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', cl: { allocated: 12, used: 1, remaining: 11 }, sl: { allocated: 8, used: 0, remaining: 8 }, el: { allocated: 15, used: 3, remaining: 12 } },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', cl: { allocated: 12, used: 6, remaining: 6 }, sl: { allocated: 8, used: 4, remaining: 4 }, el: { allocated: 15, used: 10, remaining: 5 } },
  { key: '7', name: 'Karan Mehta', department: 'Sales', cl: { allocated: 12, used: 0, remaining: 12 }, sl: { allocated: 8, used: 1, remaining: 7 }, el: { allocated: 15, used: 0, remaining: 15 } },
  { key: '8', name: 'Rajesh Kumar', department: 'Finance', cl: { allocated: 12, used: 7, remaining: 5 }, sl: { allocated: 8, used: 2, remaining: 6 }, el: { allocated: 15, used: 6, remaining: 9 } },
];

const leaveTypeColorMap: Record<string, string> = {
  'Casual Leave': 'bg-blue-50 text-blue-700 border-blue-200',
  'Sick Leave': 'bg-red-50 text-red-700 border-red-200',
  'Earned Leave': 'bg-green-50 text-green-700 border-green-200',
  'Maternity Leave': 'bg-pink-50 text-pink-700 border-pink-200',
  'Paternity Leave': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Comp Off': 'bg-purple-50 text-purple-700 border-purple-200',
  'Loss of Pay': 'bg-gray-50 text-gray-700 border-gray-200',
};

// ----- Component -----

const LeaveList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Leave type form state
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeDefaultDays, setTypeDefaultDays] = useState('');
  const [typeApplicableFor, setTypeApplicableFor] = useState('');
  const [typePaid, setTypePaid] = useState(true);
  const [typeCarryForward, setTypeCarryForward] = useState(false);

  // API hooks
  const requestParams = {
    page: String(page),
    limit: String(limit),
    ...(searchText ? { search: searchText } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  };
  const { data: requestsData, isLoading: isLoadingRequests } = useLeaveList(requestParams);
  const { data: typesData, isLoading: isLoadingTypes } = useLeaveTypeList();
  const createLeaveTypeMutation = useCreateLeaveType();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const requestsList: LeaveRequest[] = requestsData?.data ?? leaveRequests;
  const typesList: LeaveType[] = typesData?.data ?? leaveTypes;
  const requestsPagination = requestsData?.pagination;

  const pendingCount = requestsList.filter(l => l.status === 'Pending').length;
  const approvedCount = requestsList.filter(l => l.status === 'approved').length;
  const rejectedCount = requestsList.filter(l => l.status === 'rejected').length;
  const totalDaysUsed = requestsList.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);

  const statsCards: StatsCardProps[] = [
    { title: 'Pending Approval', value: pendingCount, icon: <Clock3 className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Approved This Month', value: approvedCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Rejected', value: rejectedCount, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Total Days Used', value: totalDaysUsed, icon: <Calendar className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ];

  const filteredRequests = useMemo(() => {
    if (requestsData?.data) return requestsList;
    return leaveRequests.filter(l => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesSearch = !searchText ||
        l.name.toLowerCase().includes(searchText.toLowerCase()) ||
        l.department.toLowerCase().includes(searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchText, requestsData, requestsList]);

  const filteredBalances = useMemo(() => {
    return leaveBalances.filter(b =>
      !searchText || b.name.toLowerCase().includes(searchText.toLowerCase()) ||
      b.department.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  // ----- Request Columns -----
  const requestColumns: ColumnDef<LeaveRequest>[] = [
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
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'leaveType',
      header: 'Leave Type',
      cell: ({ row }) => (
        <Badge variant="outline" className={leaveTypeColorMap[row.original.leaveType] || ''}>
          {row.original.leaveType}
        </Badge>
      ),
    },
    { accessorKey: 'from', header: 'From' },
    { accessorKey: 'to', header: 'To' },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: ({ row }) => <span className="font-semibold">{row.original.days}</span>,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-muted-foreground truncate max-w-[200px] block">
          {row.original.reason}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: 'appliedOn', header: 'Applied On' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === 'Pending' ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => approveMutation.mutate(
                  { id: row.original.key },
                  {
                    onSuccess: () => toast.success('Leave request approved'),
                    onError: (err: any) => toast.error(err?.message || 'Failed to approve'),
                  }
                )}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => rejectMutation.mutate(
                  { id: row.original.key },
                  {
                    onSuccess: () => toast.success('Leave request rejected'),
                    onError: (err: any) => toast.error(err?.message || 'Failed to reject'),
                  }
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ----- Leave Type Columns -----
  const typeColumns: ColumnDef<LeaveType>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'defaultDays',
      header: 'Default Days',
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.defaultDays || '-'}</span>
      ),
    },
    {
      accessorKey: 'carryForward',
      header: 'Carry Forward',
      cell: ({ row }) =>
        row.original.carryForward ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
    },
    {
      accessorKey: 'paid',
      header: 'Paid',
      cell: ({ row }) =>
        row.original.paid ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Yes</Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">No</Badge>
        ),
    },
    {
      accessorKey: 'applicableFor',
      header: 'Applicable For',
      cell: ({ row }) => {
        const a = row.original.applicableFor;
        const colorClass = a === 'all' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          a === 'female' ? 'bg-pink-50 text-pink-700 border-pink-200' :
          'bg-cyan-50 text-cyan-700 border-cyan-200';
        return <Badge variant="outline" className={colorClass}>{a}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  // ----- Balance Columns -----
  const balanceColumns: ColumnDef<LeaveBalance>[] = [
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
          <span className="font-medium">{row.original.name}</span>
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
      id: 'cl_allocated',
      header: 'CL Alloc',
      cell: ({ row }) => <span>{row.original.cl.allocated}</span>,
    },
    {
      id: 'cl_used',
      header: 'CL Used',
      cell: ({ row }) => (
        <span className={row.original.cl.used > 0 ? 'text-red-600' : ''}>
          {row.original.cl.used}
        </span>
      ),
    },
    {
      id: 'cl_remaining',
      header: 'CL Left',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">{row.original.cl.remaining}</span>
      ),
    },
    {
      id: 'sl_allocated',
      header: 'SL Alloc',
      cell: ({ row }) => <span>{row.original.sl.allocated}</span>,
    },
    {
      id: 'sl_used',
      header: 'SL Used',
      cell: ({ row }) => (
        <span className={row.original.sl.used > 0 ? 'text-red-600' : ''}>
          {row.original.sl.used}
        </span>
      ),
    },
    {
      id: 'sl_remaining',
      header: 'SL Left',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">{row.original.sl.remaining}</span>
      ),
    },
    {
      id: 'el_allocated',
      header: 'EL Alloc',
      cell: ({ row }) => <span>{row.original.el.allocated}</span>,
    },
    {
      id: 'el_used',
      header: 'EL Used',
      cell: ({ row }) => (
        <span className={row.original.el.used > 0 ? 'text-red-600' : ''}>
          {row.original.el.used}
        </span>
      ),
    },
    {
      id: 'el_remaining',
      header: 'EL Left',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">{row.original.el.remaining}</span>
      ),
    },
  ];

  const resetTypeForm = () => {
    setTypeName('');
    setTypeCode('');
    setTypeDefaultDays('');
    setTypeApplicableFor('');
    setTypePaid(true);
    setTypeCarryForward(false);
  };

  const handleAddType = () => {
    if (!typeName || !typeCode || !typeApplicableFor) {
      toast.error('Please fill in required fields');
      return;
    }
    createLeaveTypeMutation.mutate(
      {
        name: typeName,
        code: typeCode,
        defaultDays: Number(typeDefaultDays) || 0,
        applicableFor: typeApplicableFor,
        paid: typePaid,
        carryForward: typeCarryForward,
      },
      {
        onSuccess: () => {
          toast.success('Leave type added successfully');
          setIsTypeModalOpen(false);
          resetTypeForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to add leave type'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Manage leave requests, types and balances"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="types">Leave Types</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="requests" className="space-y-6 mt-4">
          <StatsGrid stats={statsCards} />

          <DataTable
            columns={requestColumns}
            data={filteredRequests}
            isLoading={isLoadingRequests}
            searchKey="name"
            searchPlaceholder="Search employees..."
            onSearchChange={setSearchText}
            pagination={requestsPagination ?? { page, limit, total: filteredRequests.length, totalPages: Math.ceil(filteredRequests.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
            filterContent={
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesList.map(t => (
                      <SelectItem key={t.key} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </TabsContent>

        {/* Leave Types Tab */}
        <TabsContent value="types" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsTypeModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Leave Type
            </Button>
          </div>
          <DataTable
            columns={typeColumns}
            data={typesList}
            isLoading={isLoadingTypes}
          />
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="mt-4">
          <DataTable
            columns={balanceColumns}
            data={filteredBalances}
            searchKey="name"
            searchPlaceholder="Search employees..."
            onSearchChange={setSearchText}
            filterContent={
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Add Leave Type Modal */}
      <FormDialog
        open={isTypeModalOpen}
        onOpenChange={(open) => {
          setIsTypeModalOpen(open);
          if (!open) resetTypeForm();
        }}
        title="Add Leave Type"
        description="Define a new leave type for your organization"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Leave Type Name *</Label>
              <Input
                placeholder="e.g. Casual Leave"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="e.g. CL"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Default Days *</Label>
              <Input
                type="number"
                min={0}
                placeholder="12"
                value={typeDefaultDays}
                onChange={(e) => setTypeDefaultDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Applicable For *</Label>
              <Select value={typeApplicableFor} onValueChange={setTypeApplicableFor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Paid Leave</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={typePaid} onCheckedChange={setTypePaid} />
                <span className="text-sm text-muted-foreground">{typePaid ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Carry Forward</Label>
            <div className="flex items-center gap-2">
              <Switch checked={typeCarryForward} onCheckedChange={setTypeCarryForward} />
              <span className="text-sm text-muted-foreground">{typeCarryForward ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsTypeModalOpen(false);
                resetTypeForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddType}>Add Leave Type</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default LeaveList;
