import React from 'react';
import { Card, Table, Tag, Space, Avatar, Typography, Button, Input, Progress, Badge, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, FilterOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const data = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', startDate: '2024-04-01', kycStatus: 'In Progress', kycProgress: 60, step: 'Bank Details' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', startDate: '2024-03-25', kycStatus: 'Completed', kycProgress: 100, step: 'Done' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', startDate: '2024-04-05', kycStatus: 'Pending', kycProgress: 0, step: 'Not Started' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', startDate: '2024-03-28', kycStatus: 'In Progress', kycProgress: 80, step: 'Documents' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', startDate: '2024-04-02', kycStatus: 'Rejected', kycProgress: 45, step: 'ID Verification' },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', department: 'Engineering', startDate: '2024-03-30', kycStatus: 'In Progress', kycProgress: 30, step: 'Personal Info' },
];

const OnboardingList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div><Text strong>{text}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text></div>
        </Space>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Current Step', dataIndex: 'step', key: 'step', render: (s: string) => <Text type="secondary">{s}</Text> },
    {
      title: 'KYC Status', dataIndex: 'kycStatus', key: 'kycStatus',
      render: (status: string) => {
        const colorMap: Record<string, string> = { Completed: 'green', 'In Progress': 'orange', Pending: 'default', Rejected: 'red' };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Progress', dataIndex: 'kycProgress', key: 'kycProgress',
      render: (val: number) => <Progress percent={val} size="small" strokeColor={val === 100 ? '#059669' : '#1a56db'} style={{ width: 120 }} />,
    },
    {
      title: 'Action', key: 'action',
      render: () => <Tooltip title="View Details"><Button type="link" icon={<EyeOutlined />}>View</Button></Tooltip>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Onboarding List</Title>
          <Text type="secondary">Track all employee onboarding progress</Text>
        </div>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/onboarding/new')}>
          New Onboarding
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="Search employees..." prefix={<SearchOutlined />} style={{ width: 300 }} />
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Space>
        <Table dataSource={data} columns={columns} pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} records` }} />
      </Card>
    </div>
  );
};

export default OnboardingList;
