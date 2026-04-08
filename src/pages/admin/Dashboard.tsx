import React from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, Typography, Space, List, Avatar } from 'antd';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const statsCards = [
    { title: 'Total Employees', value: 248, icon: <Users size={20} />, color: '#1a56db', change: '+12%' },
    { title: 'Pending Onboarding', value: 15, icon: <UserPlus size={20} />, color: '#d97706', change: '+3' },
    { title: 'KYC Completed', value: 230, icon: <CheckCircle2 size={20} />, color: '#059669', change: '93%' },
    { title: 'Pending Approvals', value: 8, icon: <Clock3 size={20} />, color: '#dc2626', change: '-2' },
  ];

  const recentOnboarding = [
    { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', status: 'In Progress', progress: 60 },
    { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', status: 'Completed', progress: 100 },
    { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', status: 'Pending', progress: 20 },
    { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', status: 'In Progress', progress: 75 },
    { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', status: 'Completed', progress: 100 },
  ];

  const columns = [
    { title: 'Employee', dataIndex: 'name', key: 'name', render: (text: string, record: any) => (
      <Space>
        <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      </Space>
    )},
    { title: 'Department', dataIndex: 'department', key: 'department', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
      const color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'orange' : 'red';
      return <Tag color={color}>{status}</Tag>;
    }},
    { title: 'KYC Progress', dataIndex: 'progress', key: 'progress', render: (val: number) => (
      <Progress percent={val} size="small" strokeColor={val === 100 ? '#059669' : '#1a56db'} />
    )},
  ];

  const activities = [
    { title: 'Rahul Sharma uploaded Aadhaar card', time: '2 min ago', icon: <ShieldCheck style={{ color: '#1a56db' }} size={18} /> },
    { title: 'Priya Singh completed onboarding', time: '15 min ago', icon: <CheckCircle2 style={{ color: '#059669' }} size={18} /> },
    { title: 'Amit Patel started KYC process', time: '1 hour ago', icon: <UserPlus style={{ color: '#d97706' }} size={18} /> },
    { title: 'Sneha Gupta submitted bank details', time: '3 hours ago', icon: <ShieldCheck style={{ color: '#1a56db' }} size={18} /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>HR Dashboard</Title>
        <Text type="secondary">Welcome back, Admin. Here's what's happening today.</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary">{stat.title}</Text>}
                  value={stat.value}
                  valueStyle={{ fontSize: 28, fontWeight: 700 }}
                />
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${stat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
              <Text style={{ color: stat.color, fontSize: 12 }}>
                <ArrowUpRight size={12} /> {stat.change} from last month
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Onboarding"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <Table dataSource={recentOnboarding} columns={columns} pagination={false} size="middle" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Recent Activity"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#f0f5ff' }} icon={item.icon} />}
                    title={<Text style={{ fontSize: 13 }}>{item.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>}
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
