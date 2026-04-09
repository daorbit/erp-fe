/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  useEmployeeReport, useAttendanceReport, useLeaveReport, usePayrollReport,
  useRecruitmentReport, useExpenseReport, useHeadcountReport, useTurnoverReport,
} from '@/hooks/queries/useReports';
import {
  Users, Clock, CalendarDays, IndianRupee, UserPlus, Receipt,
  BarChart3, TrendingDown, ArrowLeft, Download, FileText,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { type ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatINR } from '@/lib/formatters';

/* ============================== */
/*  Report Card Configs           */
/* ============================== */

interface ReportConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const reportCards: ReportConfig[] = [
  { key: 'employee', title: 'Employee Report', description: 'Comprehensive employee directory with demographics and status', icon: <Users className="h-7 w-7" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'attendance', title: 'Attendance Report', description: 'Daily, weekly and monthly attendance summaries', icon: <Clock className="h-7 w-7" />, color: 'text-green-600', bgColor: 'bg-green-100' },
  { key: 'leave', title: 'Leave Report', description: 'Leave utilisation, balances and trends analysis', icon: <CalendarDays className="h-7 w-7" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { key: 'payroll', title: 'Payroll Report', description: 'Salary disbursements, deductions and tax summary', icon: <IndianRupee className="h-7 w-7" />, color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { key: 'recruitment', title: 'Recruitment Report', description: 'Hiring pipeline, source analysis and time-to-hire', icon: <UserPlus className="h-7 w-7" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  { key: 'expense', title: 'Expense Report', description: 'Expense claims, reimbursements and category breakdown', icon: <Receipt className="h-7 w-7" />, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { key: 'headcount', title: 'Headcount Report', description: 'Department-wise headcount distribution and growth', icon: <BarChart3 className="h-7 w-7" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { key: 'turnover', title: 'Turnover Report', description: 'Attrition analysis, exit reasons and retention metrics', icon: <TrendingDown className="h-7 w-7" />, color: 'text-pink-600', bgColor: 'bg-pink-100' },
];

/* ============================== */
/*  Chart Data                    */
/* ============================== */

const departmentDistribution = [
  { name: 'Engineering', value: 98, color: '#1a56db' },
  { name: 'Marketing', value: 32, color: '#059669' },
  { name: 'Sales', value: 45, color: '#d97706' },
  { name: 'Finance', value: 22, color: '#7c3aed' },
  { name: 'HR', value: 18, color: '#dc2626' },
  { name: 'Operations', value: 28, color: '#0891b2' },
  { name: 'Product', value: 15, color: '#ea580c' },
];

const attendanceTrend = [
  { month: 'Jan', present: 94, absent: 4, leave: 2 },
  { month: 'Feb', present: 92, absent: 5, leave: 3 },
  { month: 'Mar', present: 96, absent: 2, leave: 2 },
  { month: 'Apr', present: 91, absent: 3, leave: 6 },
  { month: 'May', present: 93, absent: 4, leave: 3 },
  { month: 'Jun', present: 95, absent: 3, leave: 2 },
  { month: 'Jul', present: 90, absent: 5, leave: 5 },
  { month: 'Aug', present: 88, absent: 4, leave: 8 },
  { month: 'Sep', present: 94, absent: 3, leave: 3 },
  { month: 'Oct', present: 92, absent: 4, leave: 4 },
  { month: 'Nov', present: 89, absent: 3, leave: 8 },
  { month: 'Dec', present: 87, absent: 5, leave: 8 },
];

/* ============================== */
/*  Report Table Data             */
/* ============================== */

const employeeReportData = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP-001', department: 'Engineering', designation: 'Senior Software Engineer', joinDate: '2023-06-15', status: 'Active', location: 'Bangalore' },
  { key: '2', name: 'Priya Singh', empId: 'EMP-002', department: 'Marketing', designation: 'Marketing Manager', joinDate: '2022-03-20', status: 'Active', location: 'Mumbai' },
  { key: '3', name: 'Amit Patel', empId: 'EMP-003', department: 'Finance', designation: 'Financial Analyst', joinDate: '2024-01-10', status: 'Active', location: 'Bangalore' },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP-004', department: 'HR', designation: 'HR Manager', joinDate: '2021-11-05', status: 'Active', location: 'Bangalore' },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP-005', department: 'Sales', designation: 'Sales Executive', joinDate: '2024-02-28', status: 'Active', location: 'Delhi' },
  { key: '6', name: 'Ananya Reddy', empId: 'EMP-006', department: 'Engineering', designation: 'Tech Lead', joinDate: '2022-09-12', status: 'Active', location: 'Bangalore' },
  { key: '7', name: 'Karthik Nair', empId: 'EMP-007', department: 'Operations', designation: 'Operations Manager', joinDate: '2023-04-18', status: 'Active', location: 'Chennai' },
  { key: '8', name: 'Meera Iyer', empId: 'EMP-008', department: 'Product', designation: 'Product Manager', joinDate: '2023-08-01', status: 'On Leave', location: 'Bangalore' },
];

const attendanceReportData = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP-001', department: 'Engineering', presentDays: 22, absentDays: 0, leaveDays: 1, lateDays: 2, avgHours: '8.5', percentage: '95.6%' },
  { key: '2', name: 'Priya Singh', empId: 'EMP-002', department: 'Marketing', presentDays: 20, absentDays: 1, leaveDays: 2, lateDays: 0, avgHours: '8.2', percentage: '87.0%' },
  { key: '3', name: 'Amit Patel', empId: 'EMP-003', department: 'Finance', presentDays: 21, absentDays: 0, leaveDays: 2, lateDays: 1, avgHours: '9.0', percentage: '91.3%' },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP-004', department: 'HR', presentDays: 23, absentDays: 0, leaveDays: 0, lateDays: 0, avgHours: '8.8', percentage: '100%' },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP-005', department: 'Sales', presentDays: 19, absentDays: 2, leaveDays: 2, lateDays: 3, avgHours: '7.8', percentage: '82.6%' },
  { key: '6', name: 'Ananya Reddy', empId: 'EMP-006', department: 'Engineering', presentDays: 22, absentDays: 0, leaveDays: 1, lateDays: 0, avgHours: '9.2', percentage: '95.6%' },
];

const leaveReportData = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP-001', department: 'Engineering', cl: '3/10', sl: '1/7', el: '2/15', compOff: '0/2', totalUsed: 6, totalBalance: 28 },
  { key: '2', name: 'Priya Singh', empId: 'EMP-002', department: 'Marketing', cl: '5/10', sl: '2/7', el: '4/15', compOff: '1/2', totalUsed: 12, totalBalance: 22 },
  { key: '3', name: 'Amit Patel', empId: 'EMP-003', department: 'Finance', cl: '2/10', sl: '0/7', el: '1/15', compOff: '0/2', totalUsed: 3, totalBalance: 31 },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP-004', department: 'HR', cl: '4/10', sl: '3/7', el: '5/15', compOff: '2/2', totalUsed: 14, totalBalance: 20 },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP-005', department: 'Sales', cl: '6/10', sl: '2/7', el: '3/15', compOff: '0/2', totalUsed: 11, totalBalance: 23 },
];

const payrollReportData = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP-001', department: 'Engineering', basic: 60000, hra: 24000, special: 16000, pf: 7200, tax: 12500, netPay: 80300 },
  { key: '2', name: 'Priya Singh', empId: 'EMP-002', department: 'Marketing', basic: 55000, hra: 22000, special: 13000, pf: 6600, tax: 10800, netPay: 72600 },
  { key: '3', name: 'Amit Patel', empId: 'EMP-003', department: 'Finance', basic: 45000, hra: 18000, special: 12000, pf: 5400, tax: 7500, netPay: 62100 },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP-004', department: 'HR', basic: 58000, hra: 23200, special: 14800, pf: 6960, tax: 11200, netPay: 77840 },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP-005', department: 'Sales', basic: 40000, hra: 16000, special: 10000, pf: 4800, tax: 5200, netPay: 56000 },
  { key: '6', name: 'Ananya Reddy', empId: 'EMP-006', department: 'Engineering', basic: 70000, hra: 28000, special: 22000, pf: 8400, tax: 16500, netPay: 95100 },
];

const recruitmentReportData = [
  { key: '1', position: 'Senior React Developer', department: 'Engineering', applicants: 145, shortlisted: 28, interviewed: 12, offered: 3, joined: 2, status: 'Open', avgDays: 32 },
  { key: '2', position: 'Marketing Executive', department: 'Marketing', applicants: 89, shortlisted: 15, interviewed: 8, offered: 2, joined: 2, status: 'Closed', avgDays: 25 },
  { key: '3', position: 'Data Analyst', department: 'Finance', applicants: 112, shortlisted: 20, interviewed: 10, offered: 2, joined: 1, status: 'Open', avgDays: 28 },
  { key: '4', position: 'DevOps Engineer', department: 'Engineering', applicants: 78, shortlisted: 18, interviewed: 9, offered: 1, joined: 0, status: 'Open', avgDays: 35 },
  { key: '5', position: 'Business Development', department: 'Sales', applicants: 65, shortlisted: 12, interviewed: 6, offered: 2, joined: 2, status: 'Closed', avgDays: 20 },
];

const expenseReportData = [
  { key: '1', category: 'Travel', claims: 24, totalAmount: 185000, approved: 168000, pending: 17000, avgClaim: 7708 },
  { key: '2', category: 'Meals & Entertainment', claims: 38, totalAmount: 95000, approved: 88000, pending: 7000, avgClaim: 2500 },
  { key: '3', category: 'Training', claims: 12, totalAmount: 156000, approved: 142000, pending: 14000, avgClaim: 13000 },
  { key: '4', category: 'Office Supplies', claims: 18, totalAmount: 32000, approved: 30000, pending: 2000, avgClaim: 1778 },
  { key: '5', category: 'Utilities', claims: 45, totalAmount: 67500, approved: 67500, pending: 0, avgClaim: 1500 },
];

const headcountReportData = [
  { key: '1', department: 'Engineering', current: 98, lastQuarter: 90, growth: '+8', male: 72, female: 26, avgTenure: '2.4 yrs' },
  { key: '2', department: 'Marketing', current: 32, lastQuarter: 30, growth: '+2', male: 14, female: 18, avgTenure: '1.8 yrs' },
  { key: '3', department: 'Sales', current: 45, lastQuarter: 42, growth: '+3', male: 30, female: 15, avgTenure: '1.5 yrs' },
  { key: '4', department: 'Finance', current: 22, lastQuarter: 20, growth: '+2', male: 12, female: 10, avgTenure: '2.8 yrs' },
  { key: '5', department: 'HR', current: 18, lastQuarter: 17, growth: '+1', male: 6, female: 12, avgTenure: '3.1 yrs' },
  { key: '6', department: 'Operations', current: 28, lastQuarter: 26, growth: '+2', male: 20, female: 8, avgTenure: '2.0 yrs' },
  { key: '7', department: 'Product', current: 15, lastQuarter: 14, growth: '+1', male: 8, female: 7, avgTenure: '1.6 yrs' },
];

const turnoverReportData = [
  { key: '1', month: 'January', exits: 2, newJoins: 5, attritionRate: '0.8%', reason: 'Better Opportunity', department: 'Engineering' },
  { key: '2', month: 'February', exits: 1, newJoins: 3, attritionRate: '0.4%', reason: 'Relocation', department: 'Sales' },
  { key: '3', month: 'March', exits: 3, newJoins: 8, attritionRate: '1.2%', reason: 'Higher Studies', department: 'Engineering, Marketing' },
  { key: '4', month: 'April', exits: 0, newJoins: 4, attritionRate: '0.0%', reason: '--', department: '--' },
];

/* ============================== */
/*  Column Definitions            */
/* ============================== */

const DeptBadge = ({ dept }: { dept: string }) => (
  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
    {dept}
  </Badge>
);

const EmpIdCode = ({ id }: { id: string }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{id}</code>
);

const reportColumnsMap: Record<string, ColumnDef<any, any>[]> = {
  employee: [
    { accessorKey: 'empId', header: 'Emp ID', cell: ({ row }) => <EmpIdCode id={row.original.empId} /> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <DeptBadge dept={row.original.department} /> },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'joinDate', header: 'Join Date' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'location', header: 'Location' },
  ],
  attendance: [
    { accessorKey: 'empId', header: 'Emp ID', cell: ({ row }) => <EmpIdCode id={row.original.empId} /> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <DeptBadge dept={row.original.department} /> },
    { accessorKey: 'presentDays', header: 'Present', cell: ({ row }) => <span className="text-green-600 font-medium">{row.original.presentDays}</span> },
    { accessorKey: 'absentDays', header: 'Absent', cell: ({ row }) => <span className={row.original.absentDays > 0 ? 'text-red-600 font-medium' : ''}>{row.original.absentDays}</span> },
    { accessorKey: 'leaveDays', header: 'Leave' },
    { accessorKey: 'lateDays', header: 'Late', cell: ({ row }) => <span className={row.original.lateDays > 0 ? 'text-amber-600 font-medium' : ''}>{row.original.lateDays}</span> },
    { accessorKey: 'avgHours', header: 'Avg Hours' },
    {
      accessorKey: 'percentage', header: 'Attendance %', cell: ({ row }) => {
        const pct = parseFloat(row.original.percentage);
        const variant = pct >= 90 ? 'active' : pct >= 80 ? 'pending' : 'absent';
        return <StatusBadge status={variant === 'active' ? 'active' : variant === 'pending' ? 'pending' : 'absent'} />;
      },
    },
  ],
  leave: [
    { accessorKey: 'empId', header: 'Emp ID', cell: ({ row }) => <EmpIdCode id={row.original.empId} /> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <DeptBadge dept={row.original.department} /> },
    { accessorKey: 'cl', header: 'CL (Used/Total)' },
    { accessorKey: 'sl', header: 'SL (Used/Total)' },
    { accessorKey: 'el', header: 'EL (Used/Total)' },
    { accessorKey: 'compOff', header: 'Comp Off' },
    { accessorKey: 'totalUsed', header: 'Total Used', cell: ({ row }) => <span className="font-semibold">{row.original.totalUsed}</span> },
    { accessorKey: 'totalBalance', header: 'Balance', cell: ({ row }) => <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{row.original.totalBalance}</Badge> },
  ],
  payroll: [
    { accessorKey: 'empId', header: 'Emp ID', cell: ({ row }) => <EmpIdCode id={row.original.empId} /> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <DeptBadge dept={row.original.department} /> },
    { accessorKey: 'basic', header: 'Basic', cell: ({ row }) => formatINR(row.original.basic) },
    { accessorKey: 'hra', header: 'HRA', cell: ({ row }) => formatINR(row.original.hra) },
    { accessorKey: 'special', header: 'Special', cell: ({ row }) => formatINR(row.original.special) },
    { accessorKey: 'pf', header: 'PF', cell: ({ row }) => <span className="text-red-600">{formatINR(row.original.pf)}</span> },
    { accessorKey: 'tax', header: 'Tax', cell: ({ row }) => <span className="text-red-600">{formatINR(row.original.tax)}</span> },
    { accessorKey: 'netPay', header: 'Net Pay', cell: ({ row }) => <span className="text-green-600 font-semibold">{formatINR(row.original.netPay)}</span> },
  ],
  recruitment: [
    { accessorKey: 'position', header: 'Position', cell: ({ row }) => <span className="font-medium">{row.original.position}</span> },
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <DeptBadge dept={row.original.department} /> },
    { accessorKey: 'applicants', header: 'Applicants' },
    { accessorKey: 'shortlisted', header: 'Shortlisted' },
    { accessorKey: 'interviewed', header: 'Interviewed' },
    { accessorKey: 'offered', header: 'Offered' },
    { accessorKey: 'joined', header: 'Joined', cell: ({ row }) => <span className="text-green-600 font-semibold">{row.original.joined}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status === 'Open' ? 'open' : 'completed'} /> },
    { accessorKey: 'avgDays', header: 'Avg Days' },
  ],
  expense: [
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <span className="font-medium">{row.original.category}</span> },
    { accessorKey: 'claims', header: 'Claims' },
    { accessorKey: 'totalAmount', header: 'Total Amount', cell: ({ row }) => formatINR(row.original.totalAmount) },
    { accessorKey: 'approved', header: 'Approved', cell: ({ row }) => <span className="text-green-600">{formatINR(row.original.approved)}</span> },
    { accessorKey: 'pending', header: 'Pending', cell: ({ row }) => <span className={row.original.pending > 0 ? 'text-amber-600' : ''}>{formatINR(row.original.pending)}</span> },
    { accessorKey: 'avgClaim', header: 'Avg Claim', cell: ({ row }) => formatINR(row.original.avgClaim) },
  ],
  headcount: [
    { accessorKey: 'department', header: 'Department', cell: ({ row }) => <span className="font-medium">{row.original.department}</span> },
    { accessorKey: 'current', header: 'Current', cell: ({ row }) => <span className="font-semibold">{row.original.current}</span> },
    { accessorKey: 'lastQuarter', header: 'Last Quarter' },
    { accessorKey: 'growth', header: 'Growth', cell: ({ row }) => <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{row.original.growth}</Badge> },
    { accessorKey: 'male', header: 'Male' },
    { accessorKey: 'female', header: 'Female' },
    { accessorKey: 'avgTenure', header: 'Avg Tenure' },
  ],
  turnover: [
    { accessorKey: 'month', header: 'Month', cell: ({ row }) => <span className="font-medium">{row.original.month}</span> },
    { accessorKey: 'exits', header: 'Exits', cell: ({ row }) => <span className={row.original.exits > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{row.original.exits}</span> },
    { accessorKey: 'newJoins', header: 'New Joins', cell: ({ row }) => <span className="text-green-600">{row.original.newJoins}</span> },
    {
      accessorKey: 'attritionRate', header: 'Attrition Rate', cell: ({ row }) => {
        const rate = parseFloat(row.original.attritionRate);
        const status = rate > 1 ? 'rejected' : rate > 0 ? 'pending' : 'active';
        return <StatusBadge status={status} />;
      },
    },
    { accessorKey: 'reason', header: 'Primary Reason' },
    { accessorKey: 'department', header: 'Department' },
  ],
};

const reportDataMap: Record<string, any[]> = {
  employee: employeeReportData,
  attendance: attendanceReportData,
  leave: leaveReportData,
  payroll: payrollReportData,
  recruitment: recruitmentReportData,
  expense: expenseReportData,
  headcount: headcountReportData,
  turnover: turnoverReportData,
};

/* ============================== */
/*  Chart Components              */
/* ============================== */

const EXPENSE_COLORS = ['#1a56db', '#d97706', '#7c3aed', '#059669', '#0891b2'];

function ChartsForReport({ reportKey }: { reportKey: string }) {
  if (reportKey === 'headcount' || reportKey === 'employee') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reportKey === 'attendance') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Attendance Trend (% by Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#059669" strokeWidth={2} name="Present %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="absent" stroke="#dc2626" strokeWidth={2} name="Absent %" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="leave" stroke="#d97706" strokeWidth={2} name="Leave %" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (reportKey === 'turnover') {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Exits vs New Joins</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={turnoverReportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="exits" fill="#dc2626" name="Exits" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newJoins" fill="#059669" name="New Joins" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (reportKey === 'expense') {
    const pieData = expenseReportData.map((e, i) => ({
      name: e.category,
      value: e.totalAmount,
      color: EXPENSE_COLORS[i],
    }));
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatINR(value)}`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatINR(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Claims by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="claims" fill="#1a56db" name="Number of Claims" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

/* ============================== */
/*  Main Component                */
/* ============================== */

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [department, setDepartment] = useState<string>('all');

  // API integration - fetch reports conditionally based on selection
  const reportParams = { department: department !== 'all' ? department : undefined };
  const { data: employeeRpt } = useEmployeeReport(selectedReport === 'employee' && isGenerated ? reportParams : undefined);
  const { data: attendanceRpt } = useAttendanceReport(selectedReport === 'attendance' && isGenerated ? reportParams : undefined);
  const { data: leaveRpt } = useLeaveReport(selectedReport === 'leave' && isGenerated ? reportParams : undefined);
  const { data: payrollRpt } = usePayrollReport(selectedReport === 'payroll' && isGenerated ? reportParams : undefined);
  const { data: recruitmentRpt } = useRecruitmentReport(selectedReport === 'recruitment' && isGenerated ? reportParams : undefined);
  const { data: expenseRpt } = useExpenseReport(selectedReport === 'expense' && isGenerated ? reportParams : undefined);
  const { data: headcountRpt } = useHeadcountReport(selectedReport === 'headcount' && isGenerated ? reportParams : undefined);
  const { data: turnoverRpt } = useTurnoverReport(selectedReport === 'turnover' && isGenerated ? reportParams : undefined);

  const apiReportDataMap: Record<string, any> = {
    employee: employeeRpt,
    attendance: attendanceRpt,
    leave: leaveRpt,
    payroll: payrollRpt,
    recruitment: recruitmentRpt,
    expense: expenseRpt,
    headcount: headcountRpt,
    turnover: turnoverRpt,
  };

  const getReportData = (key: string) => apiReportDataMap[key]?.data ?? reportDataMap[key];

  /* ----- Report cards grid ----- */
  const renderReportGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {reportCards.map((report) => (
        <Card
          key={report.key}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => { setSelectedReport(report.key); setIsGenerated(false); }}
        >
          <CardContent className="p-6 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${report.bgColor}`}>
              <span className={report.color}>{report.icon}</span>
            </div>
            <h3 className="font-semibold mb-1">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
            <Button variant="outline" size="sm">Generate</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  /* ----- Selected report detail ----- */
  const renderSelectedReport = () => {
    const report = reportCards.find((r) => r.key === selectedReport);
    if (!report || !selectedReport) return null;

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => { setSelectedReport(null); setIsGenerated(false); }}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Button>

        {/* Report header + filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.bgColor}`}>
                  <span className={report.color}>
                    {React.cloneElement(report.icon as React.ReactElement, { className: 'h-5 w-5' })}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{report.title}</h2>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center gap-3">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsGenerated(true)}>Generate Report</Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated content: charts + table */}
        {isGenerated && (
          <>
            <ChartsForReport reportKey={selectedReport} />

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base">Report Data</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="mr-1 h-3.5 w-3.5" /> Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={reportColumnsMap[selectedReport]}
                  data={getReportData(selectedReport)}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and export comprehensive HR reports"
      />
      {selectedReport ? renderSelectedReport() : renderReportGrid()}
    </div>
  );
};

export default Reports;
