/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Space, Tag, Typography, Row, Col, Select, DatePicker,
  Divider,
} from 'antd';
import {
  Users, Clock, CalendarDays, IndianRupee, UserPlus, Receipt,
  BarChart3, TrendingDown, ArrowLeft, Download, FileText,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ReportConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const reportCards: ReportConfig[] = [
  { key: 'employee', title: 'Employee Report', description: 'Comprehensive employee directory with demographics and status', icon: <Users size={28} />, color: '#1a56db' },
  { key: 'attendance', title: 'Attendance Report', description: 'Daily, weekly and monthly attendance summaries', icon: <Clock size={28} />, color: '#059669' },
  { key: 'leave', title: 'Leave Report', description: 'Leave utilisation, balances and trends analysis', icon: <CalendarDays size={28} />, color: '#d97706' },
  { key: 'payroll', title: 'Payroll Report', description: 'Salary disbursements, deductions and tax summary', icon: <IndianRupee size={28} />, color: '#7c3aed' },
  { key: 'recruitment', title: 'Recruitment Report', description: 'Hiring pipeline, source analysis and time-to-hire', icon: <UserPlus size={28} />, color: '#dc2626' },
  { key: 'expense', title: 'Expense Report', description: 'Expense claims, reimbursements and category breakdown', icon: <Receipt size={28} />, color: '#0891b2' },
  { key: 'headcount', title: 'Headcount Report', description: 'Department-wise headcount distribution and growth', icon: <BarChart3 size={28} />, color: '#ea580c' },
  { key: 'turnover', title: 'Turnover Report', description: 'Attrition analysis, exit reasons and retention metrics', icon: <TrendingDown size={28} />, color: '#be185d' },
];

// -- Chart Data --
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

// -- Sample Report Data --
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

// -- Report Column Configs --
const reportColumns: Record<string, any[]> = {
  employee: [
    { title: 'Emp ID', dataIndex: 'empId', key: 'empId', render: (t: string) => <Text code>{t}</Text> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'orange'}>{s}</Tag> },
    { title: 'Location', dataIndex: 'location', key: 'location' },
  ],
  attendance: [
    { title: 'Emp ID', dataIndex: 'empId', key: 'empId', render: (t: string) => <Text code>{t}</Text> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Present', dataIndex: 'presentDays', key: 'presentDays', render: (v: number) => <Text style={{ color: '#059669' }}>{v}</Text> },
    { title: 'Absent', dataIndex: 'absentDays', key: 'absentDays', render: (v: number) => <Text style={{ color: v > 0 ? '#dc2626' : undefined }}>{v}</Text> },
    { title: 'Leave', dataIndex: 'leaveDays', key: 'leaveDays' },
    { title: 'Late', dataIndex: 'lateDays', key: 'lateDays', render: (v: number) => <Text style={{ color: v > 0 ? '#d97706' : undefined }}>{v}</Text> },
    { title: 'Avg Hours', dataIndex: 'avgHours', key: 'avgHours' },
    { title: 'Attendance %', dataIndex: 'percentage', key: 'percentage', render: (p: string) => <Tag color={parseFloat(p) >= 90 ? 'green' : parseFloat(p) >= 80 ? 'orange' : 'red'}>{p}</Tag> },
  ],
  leave: [
    { title: 'Emp ID', dataIndex: 'empId', key: 'empId', render: (t: string) => <Text code>{t}</Text> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'CL (Used/Total)', dataIndex: 'cl', key: 'cl' },
    { title: 'SL (Used/Total)', dataIndex: 'sl', key: 'sl' },
    { title: 'EL (Used/Total)', dataIndex: 'el', key: 'el' },
    { title: 'Comp Off', dataIndex: 'compOff', key: 'compOff' },
    { title: 'Total Used', dataIndex: 'totalUsed', key: 'totalUsed', render: (v: number) => <Text strong>{v}</Text> },
    { title: 'Balance', dataIndex: 'totalBalance', key: 'totalBalance', render: (v: number) => <Tag color="green">{v}</Tag> },
  ],
  payroll: [
    { title: 'Emp ID', dataIndex: 'empId', key: 'empId', render: (t: string) => <Text code>{t}</Text> },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Basic', dataIndex: 'basic', key: 'basic', render: (v: number) => `\u20B9${v.toLocaleString('en-IN')}` },
    { title: 'HRA', dataIndex: 'hra', key: 'hra', render: (v: number) => `\u20B9${v.toLocaleString('en-IN')}` },
    { title: 'Special', dataIndex: 'special', key: 'special', render: (v: number) => `\u20B9${v.toLocaleString('en-IN')}` },
    { title: 'PF', dataIndex: 'pf', key: 'pf', render: (v: number) => <Text type="danger">{`\u20B9${v.toLocaleString('en-IN')}`}</Text> },
    { title: 'Tax', dataIndex: 'tax', key: 'tax', render: (v: number) => <Text type="danger">{`\u20B9${v.toLocaleString('en-IN')}`}</Text> },
    { title: 'Net Pay', dataIndex: 'netPay', key: 'netPay', render: (v: number) => <Text strong style={{ color: '#059669' }}>{`\u20B9${v.toLocaleString('en-IN')}`}</Text> },
  ],
  recruitment: [
    { title: 'Position', dataIndex: 'position', key: 'position', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Applicants', dataIndex: 'applicants', key: 'applicants' },
    { title: 'Shortlisted', dataIndex: 'shortlisted', key: 'shortlisted' },
    { title: 'Interviewed', dataIndex: 'interviewed', key: 'interviewed' },
    { title: 'Offered', dataIndex: 'offered', key: 'offered' },
    { title: 'Joined', dataIndex: 'joined', key: 'joined', render: (v: number) => <Text strong style={{ color: '#059669' }}>{v}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Open' ? 'blue' : 'green'}>{s}</Tag> },
    { title: 'Avg Days', dataIndex: 'avgDays', key: 'avgDays' },
  ],
  expense: [
    { title: 'Category', dataIndex: 'category', key: 'category', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Claims', dataIndex: 'claims', key: 'claims' },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `\u20B9${v.toLocaleString('en-IN')}` },
    { title: 'Approved', dataIndex: 'approved', key: 'approved', render: (v: number) => <Text style={{ color: '#059669' }}>{`\u20B9${v.toLocaleString('en-IN')}`}</Text> },
    { title: 'Pending', dataIndex: 'pending', key: 'pending', render: (v: number) => <Text style={{ color: v > 0 ? '#d97706' : undefined }}>{`\u20B9${v.toLocaleString('en-IN')}`}</Text> },
    { title: 'Avg Claim', dataIndex: 'avgClaim', key: 'avgClaim', render: (v: number) => `\u20B9${v.toLocaleString('en-IN')}` },
  ],
  headcount: [
    { title: 'Department', dataIndex: 'department', key: 'department', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Current', dataIndex: 'current', key: 'current', render: (v: number) => <Text strong>{v}</Text> },
    { title: 'Last Quarter', dataIndex: 'lastQuarter', key: 'lastQuarter' },
    { title: 'Growth', dataIndex: 'growth', key: 'growth', render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: 'Male', dataIndex: 'male', key: 'male' },
    { title: 'Female', dataIndex: 'female', key: 'female' },
    { title: 'Avg Tenure', dataIndex: 'avgTenure', key: 'avgTenure' },
  ],
  turnover: [
    { title: 'Month', dataIndex: 'month', key: 'month', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Exits', dataIndex: 'exits', key: 'exits', render: (v: number) => <Text style={{ color: v > 0 ? '#dc2626' : '#059669' }}>{v}</Text> },
    { title: 'New Joins', dataIndex: 'newJoins', key: 'newJoins', render: (v: number) => <Text style={{ color: '#059669' }}>{v}</Text> },
    { title: 'Attrition Rate', dataIndex: 'attritionRate', key: 'attritionRate', render: (r: string) => <Tag color={parseFloat(r) > 1 ? 'red' : parseFloat(r) > 0 ? 'orange' : 'green'}>{r}</Tag> },
    { title: 'Primary Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
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

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);

  const renderReportGrid = () => (
    <Row gutter={[16, 16]}>
      {reportCards.map(report => (
        <Col xs={24} sm={12} lg={6} key={report.key}>
          <Card
            bordered={false}
            hoverable
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
            onClick={() => { setSelectedReport(report.key); setIsGenerated(false); }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `${report.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: report.color,
              }}>
                {report.icon}
              </div>
              <Title level={5} style={{ margin: '0 0 8px 0' }}>{report.title}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{report.description}</Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" ghost>Generate</Button>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderCharts = () => {
    if (selectedReport === 'headcount' || selectedReport === 'employee') {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} title="Department Distribution">
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
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} title="Headcount by Department">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#1a56db" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      );
    }

    if (selectedReport === 'attendance') {
      return (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }} title="Attendance Trend (% by Month)">
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
        </Card>
      );
    }

    if (selectedReport === 'turnover') {
      return (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }} title="Exits vs New Joins">
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
        </Card>
      );
    }

    if (selectedReport === 'expense') {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} title="Expense by Category">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseReportData.map((e, i) => ({ name: e.category, value: e.totalAmount, color: ['#1a56db', '#d97706', '#7c3aed', '#059669', '#0891b2'][i] }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: \u20B9${(value / 1000).toFixed(0)}K`}
                  >
                    {expenseReportData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={['#1a56db', '#d97706', '#7c3aed', '#059669', '#0891b2'][i]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `\u20B9${value.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} title="Claims by Category">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseReportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="claims" fill="#1a56db" name="Number of Claims" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      );
    }

    return null;
  };

  const renderSelectedReport = () => {
    const report = reportCards.find(r => r.key === selectedReport);
    if (!report) return null;

    return (
      <div>
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => { setSelectedReport(null); setIsGenerated(false); }}
          style={{ marginBottom: 16 }}
        >
          Back to Reports
        </Button>

        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${report.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: report.color,
              }}>
                {React.cloneElement(report.icon as React.ReactElement, { size: 22 })}
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>{report.title}</Title>
                <Text type="secondary">{report.description}</Text>
              </div>
            </Space>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Space wrap style={{ marginBottom: 16 }}>
            <RangePicker />
            <Select
              placeholder="Department"
              allowClear
              style={{ width: 180 }}
              value={department}
              onChange={setDepartment}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
                { value: 'Finance', label: 'Finance' },
                { value: 'HR', label: 'HR' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Product', label: 'Product' },
              ]}
            />
            <Button type="primary" onClick={() => setIsGenerated(true)}>
              Generate Report
            </Button>
          </Space>
        </Card>

        {isGenerated && (
          <>
            {renderCharts()}

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Report Data</Text>
                <Space>
                  <Button icon={<Download size={14} />}>Export CSV</Button>
                  <Button icon={<FileText size={14} />}>Export PDF</Button>
                </Space>
              </div>
              <Table
                dataSource={reportDataMap[selectedReport!]}
                columns={reportColumns[selectedReport!]}
                pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} records` }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Reports & Analytics</Title>
        <Text type="secondary">Generate and export comprehensive HR reports</Text>
      </div>

      {selectedReport ? renderSelectedReport() : renderReportGrid()}
    </div>
  );
};

export default Reports;
