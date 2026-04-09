import React, { useState } from 'react';
import { Card, Table, Button, Select, Row, Col, Typography, Space, DatePicker, Empty, Spin } from 'antd';
import {
  Users, Clock, CalendarDays, IndianRupee, UserPlus, Receipt, TrendingUp, TrendingDown,
  FileBarChart, BarChart3,
} from 'lucide-react';
import {
  useEmployeeReport, useAttendanceReport, useLeaveReport, usePayrollReport,
  useRecruitmentReport, useExpenseReport, useHeadcountReport, useTurnoverReport,
} from '@/hooks/queries/useReports';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface ReportDef {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  chartType: 'bar' | 'line' | 'pie';
}

const reportDefs: ReportDef[] = [
  { key: 'employee', title: 'Employee Report', description: 'Employee demographics and details', icon: <Users size={24} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950', chartType: 'bar' },
  { key: 'attendance', title: 'Attendance Report', description: 'Attendance patterns and trends', icon: <Clock size={24} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950', chartType: 'bar' },
  { key: 'leave', title: 'Leave Report', description: 'Leave utilization and balances', icon: <CalendarDays size={24} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950', chartType: 'bar' },
  { key: 'payroll', title: 'Payroll Report', description: 'Salary and compensation analysis', icon: <IndianRupee size={24} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950', chartType: 'line' },
  { key: 'recruitment', title: 'Recruitment Report', description: 'Hiring funnel and metrics', icon: <UserPlus size={24} />, color: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-950', chartType: 'bar' },
  { key: 'expense', title: 'Expense Report', description: 'Expense claims and reimbursements', icon: <Receipt size={24} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950', chartType: 'pie' },
  { key: 'headcount', title: 'Headcount Report', description: 'Department-wise headcount trends', icon: <TrendingUp size={24} />, color: '#06b6d4', bg: 'bg-cyan-50 dark:bg-cyan-950', chartType: 'bar' },
  { key: 'turnover', title: 'Turnover Report', description: 'Attrition and retention analysis', icon: <TrendingDown size={24} />, color: '#84cc16', bg: 'bg-lime-50 dark:bg-lime-950', chartType: 'line' },
];

const hookMap: Record<string, (params?: any) => any> = {
  employee: useEmployeeReport,
  attendance: useAttendanceReport,
  leave: useLeaveReport,
  payroll: usePayrollReport,
  recruitment: useRecruitmentReport,
  expense: useExpenseReport,
  headcount: useHeadcountReport,
  turnover: useTurnoverReport,
};

const ReportView: React.FC<{ reportKey: string; chartType: 'bar' | 'line' | 'pie'; onBack: () => void }> = ({ reportKey, chartType, onBack }) => {
  const [department, setDepartment] = useState<string | undefined>();
  const useHook = hookMap[reportKey];
  const { data, isLoading } = useHook({ department });
  const reportData: any[] = data?.data ?? [];

  const columns = reportData.length > 0
    ? Object.keys(reportData[0]).filter(k => k !== '_id' && k !== 'id').map(k => ({
        title: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
        dataIndex: k,
        key: k,
        render: (v: any) => typeof v === 'number' ? v.toLocaleString('en-IN') : v ?? '-',
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={onBack}>Back to Reports</Button>
        <Space>
          <Select placeholder="Department" allowClear className="min-w-[160px]" value={department} onChange={setDepartment}
            options={['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'Operations'].map(d => ({ value: d, label: d }))} />
        </Space>
      </div>

      {isLoading ? (
        <Card bordered={false} className="flex items-center justify-center py-16"><Spin size="large" /></Card>
      ) : reportData.length === 0 ? (
        <Card bordered={false}><Empty description="No data available for this report" /></Card>
      ) : (
        <>
          <Card bordered={false}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={reportData} dataKey={Object.keys(reportData[0]).find(k => typeof reportData[0][k] === 'number') ?? 'value'} nameKey={Object.keys(reportData[0]).find(k => typeof reportData[0][k] === 'string') ?? 'name'} cx="50%" cy="50%" outerRadius={100} label>
                      {reportData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : chartType === 'line' ? (
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(reportData[0]).find(k => typeof reportData[0][k] === 'string') ?? 'name'} />
                    <YAxis />
                    <Tooltip />
                    {Object.keys(reportData[0]).filter(k => typeof reportData[0][k] === 'number').slice(0, 3).map((k, i) => (
                      <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i]} strokeWidth={2} />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(reportData[0]).find(k => typeof reportData[0][k] === 'string') ?? 'name'} />
                    <YAxis />
                    <Tooltip />
                    {Object.keys(reportData[0]).filter(k => typeof reportData[0][k] === 'number').slice(0, 3).map((k, i) => (
                      <Bar key={k} dataKey={k} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          <Card bordered={false} title="Data">
            <Table columns={columns} dataSource={reportData} rowKey={(_: any, i?: number) => String(i)} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 600 }} />
          </Card>
        </>
      )}
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const activeDef = reportDefs.find(r => r.key === activeReport);

  if (activeReport && activeDef) {
    return (
      <div className="space-y-6">
        <div>
          <Title level={4} className="!mb-1">{activeDef.title}</Title>
          <Text type="secondary">{activeDef.description}</Text>
        </div>
        <ReportView reportKey={activeReport} chartType={activeDef.chartType} onBack={() => setActiveReport(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Reports</Title>
        <Text type="secondary">Generate and view HR reports</Text>
      </div>

      <Row gutter={[16, 16]}>
        {reportDefs.map((report) => (
          <Col key={report.key} xs={24} sm={12} lg={6}>
            <Card bordered={false} hoverable className="h-full cursor-pointer" onClick={() => setActiveReport(report.key)}>
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.bg}`}>
                  <span style={{ color: report.color }}>{report.icon}</span>
                </div>
                <div>
                  <Title level={5} className="!mb-1">{report.title}</Title>
                  <Text type="secondary" className="text-sm">{report.description}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Reports;
