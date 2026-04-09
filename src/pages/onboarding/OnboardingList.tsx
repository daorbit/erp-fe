import React from 'react';
import { Card, Table, Avatar, Tag, Progress, Button, Typography } from 'antd';
import { EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const data = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', startDate: '2024-04-01', kycStatus: 'In Progress', kycProgress: 60, step: 'Bank Details' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', startDate: '2024-03-25', kycStatus: 'Completed', kycProgress: 100, step: 'Done' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', startDate: '2024-04-05', kycStatus: 'Pending', kycProgress: 0, step: 'Not Started' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', startDate: '2024-03-28', kycStatus: 'In Progress', kycProgress: 80, step: 'Documents' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', startDate: '2024-04-02', kycStatus: 'Rejected', kycProgress: 45, step: 'ID Verification' },
];

const statusColor: Record<string, string> = { Completed: 'green', 'In Progress': 'orange', Pending: 'gold', Rejected: 'red' };

const OnboardingList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">{r.name.split(' ').map((n: string) => n[0]).join('')}</Avatar>
          <div><div className="font-medium">{r.name}</div><div className="text-xs text-gray-400">{r.email}</div></div>
        </div>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Current Step', dataIndex: 'step', key: 'step', render: (s: string) => <Text type="secondary">{s}</Text> },
    { title: 'Status', dataIndex: 'kycStatus', key: 'kycStatus', render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
    {
      title: 'Progress', dataIndex: 'kycProgress', key: 'kycProgress',
      render: (val: number) => (
        <div className="flex items-center gap-2 w-[130px]">
          <Progress percent={val} size="small" showInfo={false} strokeColor={val === 100 ? '#10b981' : '#3b82f6'} />
          <span className="text-xs text-gray-500">{val}%</span>
        </div>
      ),
    },
    {
      title: 'Action', key: 'actions',
      render: () => <Button type="link" icon={<EyeOutlined />} size="small">View</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Title level={4} className="!mb-1">Onboarding List</Title><Text type="secondary">Track all employee onboarding progress</Text></div>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/onboarding/new')}>New Onboarding</Button>
      </div>
      <Card bordered={false}>
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default OnboardingList;
