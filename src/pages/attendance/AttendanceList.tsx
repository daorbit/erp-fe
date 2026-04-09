import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock3,
  Palmtree,
  Eye,
  Edit2,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import type { StatsCardProps } from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';
import DatePicker from '@/components/shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useAttendanceList, useMarkAttendance } from '@/hooks/queries/useAttendance';

interface AttendanceRecord {
  key: string;
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
  overtime: string;
}

const attendanceData: AttendanceRecord[] = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:15 PM', workHours: '9h 13m', status: 'present', overtime: '0h 13m' },
  { key: '2', name: 'Priya Singh', department: 'Marketing', checkIn: '09:28 AM', checkOut: '06:30 PM', workHours: '9h 02m', status: 'present', overtime: '0h 02m' },
  { key: '3', name: 'Amit Patel', department: 'Finance', checkIn: '-', checkOut: '-', workHours: '-', status: 'absent', overtime: '-' },
  { key: '4', name: 'Sneha Gupta', department: 'HR', checkIn: '09:45 AM', checkOut: '06:00 PM', workHours: '8h 15m', status: 'late', overtime: '-' },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', checkIn: '-', checkOut: '-', workHours: '-', status: 'on_leave', overtime: '-' },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', checkIn: '09:00 AM', checkOut: '06:20 PM', workHours: '9h 20m', status: 'present', overtime: '0h 20m' },
  { key: '7', name: 'Karan Mehta', department: 'Sales', checkIn: '09:05 AM', checkOut: '06:00 PM', workHours: '8h 55m', status: 'present', overtime: '-' },
  { key: '8', name: 'Deepika Nair', department: 'Engineering', checkIn: '09:15 AM', checkOut: '01:00 PM', workHours: '3h 45m', status: 'half_day', overtime: '-' },
  { key: '9', name: 'Rajesh Kumar', department: 'Finance', checkIn: '09:10 AM', checkOut: '06:25 PM', workHours: '9h 15m', status: 'present', overtime: '0h 15m' },
  { key: '10', name: 'Meera Iyer', department: 'Marketing', checkIn: '09:00 AM', checkOut: '06:00 PM', workHours: '9h 00m', status: 'work_from_home', overtime: '-' },
  { key: '11', name: 'Suresh Pillai', department: 'HR', checkIn: '-', checkOut: '-', workHours: '-', status: 'absent', overtime: '-' },
  { key: '12', name: 'Neha Deshmukh', department: 'Engineering', checkIn: '09:50 AM', checkOut: '06:30 PM', workHours: '8h 40m', status: 'late', overtime: '-' },
  { key: '13', name: 'Arjun Malhotra', department: 'Sales', checkIn: '09:08 AM', checkOut: '06:10 PM', workHours: '9h 02m', status: 'present', overtime: '0h 02m' },
  { key: '14', name: 'Pooja Verma', department: 'Finance', checkIn: '-', checkOut: '-', workHours: '-', status: 'on_leave', overtime: '-' },
];

const statusLabelMap: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
  on_leave: 'On Leave',
  work_from_home: 'WFH',
  holiday: 'Holiday',
  week_off: 'Week Off',
};

const AttendanceList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const queryParams = {
    page,
    limit,
    date: selectedDate?.toISOString().split('T')[0],
    status: activeTab !== 'All' ? activeTab : undefined,
  };

  const { data, isLoading } = useAttendanceList(queryParams);
  const markAttendanceMutation = useMarkAttendance();

  const allAttendance: AttendanceRecord[] = data?.data ?? attendanceData;
  const paginationData = data?.pagination;

  // Form state
  const [formEmployee, setFormEmployee] = useState('');
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formStatus, setFormStatus] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');

  const presentCount = allAttendance.filter(a => a.status === 'present').length;
  const absentCount = allAttendance.filter(a => a.status === 'absent').length;
  const lateCount = allAttendance.filter(a => a.status === 'late').length;
  const onLeaveCount = allAttendance.filter(a => a.status === 'on_leave').length;
  const wfhCount = allAttendance.filter(a => a.status === 'work_from_home').length;

  const statsCards: StatsCardProps[] = [
    { title: 'Present Today', value: presentCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Absent', value: absentCount, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Late', value: lateCount, icon: <Clock3 className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'On Leave', value: onLeaveCount, icon: <Palmtree className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ];

  const filteredData = useMemo(() => {
    // If API data is used with status filter in query, no client-side filtering needed
    if (data?.data) return allAttendance;
    return allAttendance.filter(item => {
      return activeTab === 'All' || item.status === activeTab;
    });
  }, [activeTab, allAttendance, data?.data]);

  const columns: ColumnDef<AttendanceRecord>[] = [
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
      accessorKey: 'checkIn',
      header: 'Check In',
    },
    {
      accessorKey: 'checkOut',
      header: 'Check Out',
    },
    {
      accessorKey: 'workHours',
      header: 'Work Hours',
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.workHours}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={statusLabelMap[row.original.status] || row.original.status} />
      ),
    },
    {
      accessorKey: 'overtime',
      header: 'Overtime',
      cell: ({ row }) =>
        row.original.overtime !== '-' ? (
          <span className="text-emerald-600 font-medium">{row.original.overtime}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const resetForm = () => {
    setFormEmployee('');
    setFormDate(undefined);
    setFormStatus('');
    setFormCheckIn('');
    setFormCheckOut('');
  };

  const handleSubmit = () => {
    if (!formEmployee || !formStatus) {
      toast.error('Please fill in required fields');
      return;
    }
    markAttendanceMutation.mutate(
      {
        employeeId: formEmployee,
        date: formDate?.toISOString().split('T')[0],
        status: formStatus,
        checkIn: formCheckIn,
        checkOut: formCheckOut,
      },
      {
        onSuccess: () => {
          toast.success('Attendance marked successfully');
          setIsModalOpen(false);
          resetForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to mark attendance'),
      }
    );
  };

  const tabItems = [
    { value: 'All', label: `All (${allAttendance.length})` },
    { value: 'present', label: `Present (${presentCount})` },
    { value: 'absent', label: `Absent (${absentCount})` },
    { value: 'late', label: `Late (${lateCount})` },
    { value: 'on_leave', label: `On Leave (${onLeaveCount})` },
    { value: 'work_from_home', label: `WFH (${wfhCount})` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Track and manage employee attendance"
        actions={
          <>
            <div className="w-[200px]">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select date"
              />
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </>
        }
      />

      <StatsGrid stats={statsCards} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {tabItems.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Search employees..."
            onSearchChange={() => {}}
            filterContent={
              <Select>
                <SelectTrigger className="w-[180px]">
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

      <FormDialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}
        title="Mark Attendance"
        description="Record attendance for an employee"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select value={formEmployee} onValueChange={setFormEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {attendanceData.map(e => (
                  <SelectItem key={e.key} value={e.key}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <DatePicker value={formDate} onChange={setFormDate} placeholder="Select date" />
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="HalfDay">Half Day</SelectItem>
                  <SelectItem value="OnLeave">On Leave</SelectItem>
                  <SelectItem value="WorkFromHome">Work From Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check In Time</Label>
              <Input
                type="time"
                value={formCheckIn}
                onChange={(e) => setFormCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Check Out Time</Label>
              <Input
                type="time"
                value={formCheckOut}
                onChange={(e) => setFormCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default AttendanceList;
