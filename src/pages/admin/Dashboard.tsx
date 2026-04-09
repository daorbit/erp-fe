/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, Statistic, Table, Avatar, Tag, Progress, Typography, Row, Col, List } from 'antd';
import {
  User,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useDashboardStats, useRecentActivities } from '@/hooks/queries/useDashboard';

const { Title, Text } = Typography;

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
    { title: 'Rahul Sharma uploaded Aadhaar card', time: '2 min ago', icon: <ShieldCheck className="text-blue-600" size={16} /> },
    { title: 'Priya Singh completed onboarding', time: '15 min ago', icon: <CheckCircle2 className="text-green-600" size={16} /> },
    { title: 'Amit Patel started KYC process', time: '1 hour ago', icon: <UserPlus className="text-amber-600" size={16} /> },
    { title: 'Sneha Gupta submitted bank details', time: '3 hours ago', icon: <ShieldCheck className="text-blue-600" size={16} /> },
]
const statusColorMap: Record<string, string> = {
  'Completed': 'green',
  'In Progress': 'orange',
  'Pending': 'gold',
};

const columns = [
  {
    title: 'Employee',
    dataIndex: 'name',
    key: 'name',
    render: (_: any, record: OnboardingRecord) => (
      <div className="flex items-center gap-3">
        <Avatar className="bg-blue-600" size={32}>
          {record.name.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <div>
          <div className="font-medium text-sm">{record.name}</div>
          <div className="text-xs text-gray-400">{record.email}</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    render: (dept: string) => <Tag color="blue">{dept}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>,
  },
  {
    title: 'KYC Progress',
    dataIndex: 'progress',
    key: 'progress',
    render: (val: number) => (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress percent={val} size="small" showInfo={false} strokeColor={val === 100 ? '#10b981' : '#3b82f6'} className="flex-1" />
        <span className="text-xs text-gray-500 w-9 text-right">{val}%</span>
      </div>
    ),
  },
];

const stats = [
  {
    title: 'Total Employees',
    value: 248,
    icon: <Users size={20} />,
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-950',
    change: '+12%',
    changeType: 'up' as const,
    sub: 'from last month',
  },
  {
    title: 'Pending Onboarding',
    value: 15,
    icon: <UserPlus size={20} />,
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-950',
    change: '+3',
    changeType: 'up' as const,
    sub: 'from last month',
  },
  {
    title: 'KYC Completed',
    value: 230,
    icon: <CheckCircle2 size={20} />,
    color: '#10b981',
    bg: 'bg-green-50 dark:bg-green-950',
    change: '93%',
    changeType: 'up' as const,
    sub: 'completion rate',
  },
  {
    title: 'Pending Approvals',
    value: 8,
    icon: <Clock size={20} />,
    color: '#ef4444',
    bg: 'bg-red-50 dark:bg-red-950',
    change: '-2',
    changeType: 'down' as const,
    sub: 'from last month',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Title level={4} className="!mb-1">HR Dashboard</Title>
        <Text type="secondary">Welcome back, Admin. Here's what's happening today.</Text>
      </div>

      {/* Stats Cards - like reference image */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card className="h-full hover:shadow-md transition-shadow" bordered={false}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <span style={{ color: stat.color, fontSize: 20 }}>{stat.icon}</span>
                </div>
                <Tag
                  color={stat.changeType === 'up' ? 'green' : 'red'}
                  className="!m-0 !rounded-full !text-xs !px-2"
                >
                  {stat.changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {stat.change}
                </Tag>
              </div>
              <div className="mt-4">
                <Text type="secondary" className="text-xs">{stat.title}</Text>
                <div className="text-2xl font-bold mt-0.5">{stat.value.toLocaleString()}</div>
                <Text type="secondary" className="text-xs">{stat.sub}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Table */}
        <Col xs={24} lg={16}>
          <Card title="Recent Onboarding" bordered={false}>
            <Table
              columns={columns}
              dataSource={recentOnboarding}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={8}>
          <Card title="Recent Activity" bordered={false} className="h-full">
            <List
              dataSource={activities}
              renderItem={(activity) => (
                <List.Item className="!px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar size={36} className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {activity.icon}
                      </Avatar>
                    }
                    title={<Text className="text-sm">{activity.title}</Text>}
                    description={<Text type="secondary" className="text-xs">{activity.time}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
