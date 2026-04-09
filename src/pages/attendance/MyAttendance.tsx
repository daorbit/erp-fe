import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  LogIn, LogOut, CheckCircle2, XCircle, Clock3, Timer, Laptop, Calendar,
} from 'lucide-react';

import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMyAttendance, useCheckIn, useCheckOut, useAttendanceSummary } from '@/hooks/queries/useAttendance';

const statusLabelMap: Record<string, string> = {
  Present: 'Present',
  Absent: 'Absent',
  Late: 'Late',
  HalfDay: 'Half Day',
  OnLeave: 'On Leave',
  WorkFromHome: 'WFH',
  Holiday: 'Holiday',
  WeekOff: 'Week Off',
};

const dayColors: Record<string, string> = {
  Present: 'bg-green-500',
  Absent: 'bg-gray-300',
  Late: 'bg-amber-500',
  HalfDay: 'bg-yellow-400',
  OnLeave: 'bg-blue-500',
  WorkFromHome: 'bg-violet-500',
  Holiday: 'bg-teal-500',
  WeekOff: 'bg-slate-400',
};

interface AttendanceLog {
  key: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
}

const recentLog: AttendanceLog[] = [
  { key: '1', date: '08 Apr 2026', day: 'Wednesday', checkIn: '09:15 AM', checkOut: '-', workHours: '-', status: 'present' },
  { key: '2', date: '07 Apr 2026', day: 'Tuesday', checkIn: '09:02 AM', checkOut: '06:20 PM', workHours: '9h 18m', status: 'present' },
  { key: '3', date: '06 Apr 2026', day: 'Monday', checkIn: '09:30 AM', checkOut: '06:00 PM', workHours: '8h 30m', status: 'late' },
  { key: '4', date: '05 Apr 2026', day: 'Sunday', checkIn: '-', checkOut: '-', workHours: '-', status: 'absent' },
  { key: '5', date: '04 Apr 2026', day: 'Saturday', checkIn: '-', checkOut: '-', workHours: '-', status: 'absent' },
  { key: '6', date: '03 Apr 2026', day: 'Friday', checkIn: '09:00 AM', checkOut: '06:15 PM', workHours: '9h 15m', status: 'present' },
  { key: '7', date: '02 Apr 2026', day: 'Thursday', checkIn: '09:10 AM', checkOut: '06:00 PM', workHours: '8h 50m', status: 'present' },
];

const calendarStatuses: Record<number, string> = {
  1: 'present', 2: 'present', 3: 'present', 4: 'absent', 5: 'absent',
  6: 'late', 7: 'present', 8: 'present', 9: 'work_from_home', 10: 'present',
  11: 'absent', 12: 'absent', 13: 'present', 14: 'present', 15: 'on_leave',
  16: 'present', 17: 'present', 18: 'absent', 19: 'absent', 20: 'present',
  21: 'half_day', 22: 'present', 23: 'present', 24: 'present', 25: 'absent',
  26: 'absent', 27: 'present', 28: 'present', 29: 'present', 30: 'present',
};

// April 2026 starts on Wednesday (index 3)
const firstDayOfWeek = 3;
const daysInMonth = 30;
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarCells: (number | null)[] = [];
for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
while (calendarCells.length % 7 !== 0) calendarCells.push(null);

const MyAttendance: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const { data: myAttendanceData, isLoading } = useMyAttendance();
  const { data: summaryData } = useAttendanceSummary('me');
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const attendanceLog: AttendanceLog[] = myAttendanceData?.data ?? recentLog;
  const summary = summaryData?.data;

  const checkInTime = summary?.checkInTime ?? '09:15 AM';

  const handleCheckInOut = () => {
    if (isCheckedIn) {
      checkOutMutation.mutate({}, {
        onSuccess: () => {
          toast.success('Checked out successfully');
          setIsCheckedIn(false);
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to check out'),
      });
    } else {
      checkInMutation.mutate({}, {
        onSuccess: () => {
          toast.success('Checked in successfully');
          setIsCheckedIn(true);
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to check in'),
      });
    }
  };

  const summaryStats = [
    { title: 'Present Days', value: summary?.presentDays ?? 17, icon: <CheckCircle2 size={20} />, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950' },
    { title: 'Absent', value: summary?.absentDays ?? 2, icon: <XCircle size={20} />, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
    { title: 'Late', value: summary?.lateDays ?? 1, icon: <Clock3 size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
    { title: 'Half Days', value: summary?.halfDays ?? 1, icon: <Timer size={20} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950' },
    { title: 'Work From Home', value: summary?.wfhDays ?? 1, icon: <Laptop size={20} />, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-950' },
    { title: 'Overtime Hours', value: summary?.overtimeHours ?? '12h 30m', icon: <Clock3 size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
  ];

  const columns: ColumnDef<AttendanceLog>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="font-medium">{row.original.date}</span> },
    { accessorKey: 'day', header: 'Day' },
    { accessorKey: 'checkIn', header: 'Check In' },
    { accessorKey: 'checkOut', header: 'Check Out' },
    { accessorKey: 'workHours', header: 'Work Hours', cell: ({ row }) => <span className="font-medium">{row.original.workHours}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance"
        description="View and manage your attendance records"
      />

      {/* Check In / Calendar Row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        {/* Check In Card */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className={`mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full ${isCheckedIn ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'}`}>
                {isCheckedIn ? (
                  <CheckCircle2 size={32} className="text-green-600" />
                ) : (
                  <XCircle size={32} className="text-red-600" />
                )}
              </div>
              <p className="font-semibold text-base">
                {isCheckedIn ? `Checked In at ${checkInTime}` : 'Not Checked In'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isCheckedIn ? 'Working hours in progress...' : 'Click below to mark your attendance'}
              </p>
            </div>
            <Button
              size="lg"
              variant={isCheckedIn ? 'destructive' : 'default'}
              className="w-[200px] h-12 text-base rounded-xl"
              onClick={handleCheckInOut}
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
            >
              {isCheckedIn ? <LogOut className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={18} /> April 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map(day => (
                <div key={day} className="py-1 text-xs font-semibold text-muted-foreground">{day}</div>
              ))}
              {calendarCells.map((day, idx) => (
                <div
                  key={idx}
                  className="relative py-2 text-sm rounded-lg"
                >
                  {day ? (
                    <>
                      <span className={day <= 8 ? 'font-semibold' : ''}>{day}</span>
                      {calendarStatuses[day] && (
                        <div className={`mx-auto mt-0.5 h-2 w-2 rounded-full ${dayColors[calendarStatuses[day]] || 'bg-gray-300'}`} />
                      )}
                    </>
                  ) : null}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(dayColors).map(([label, colorClass]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                  <span className="text-[11px]">{statusLabelMap[label] || label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={attendanceLog} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;
