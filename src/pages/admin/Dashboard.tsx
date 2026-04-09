import React from 'react';
import { Card, Statistic, Table, Avatar, Tag, Progress, Typography, Row, Col, List, Spin } from 'antd';
import {
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useDashboardStats, useRecentActivities } from '@/hooks/queries/useDashboard';
import { useEmployeeList } from '@/hooks/queries/useEmployees';

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  completed: 'green',
  in_progress: 'orange',
  pending: 'gold',
  active: 'green',
  inactive: 'red',
};

const columns = [
  {
    title: 'Employee',
    dataIndex: 'name',
    key: 'name',
    render: (_: any, record: any) => {
      const name = record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A';
      return (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>
            {name.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{name}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    render: (dept: any) => <Tag color="blue">{typeof dept === 'object' ? dept?.name : dept || 'N/A'}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => <Tag>{role}</Tag>,
  },
];

const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities();
  const { data: employeeData, isLoading: employeesLoading } = useEmployeeList({ limit: '5' });

  const apiStats = statsData?.data;
  const employees = employeeData?.data ?? [];
  const activities = activitiesData?.data ?? [];

  const stats = [
    {
      title: 'Total Employees',
      value: apiStats?.totalEmployees ?? 0,
      icon: <Users size={20} />,
      color: '#3b82f6',
      bg: 'bg-blue-50 dark:bg-blue-950',
      change: apiStats?.employeeChange ?? '0',
      changeType: 'up' as const,
      sub: 'from last month',
    },
    {
      title: 'Pending Onboarding',
      value: apiStats?.pendingOnboarding ?? 0,
      icon: <UserPlus size={20} />,
      color: '#f59e0b',
      bg: 'bg-amber-50 dark:bg-amber-950',
      change: apiStats?.onboardingChange ?? '0',
      changeType: 'up' as const,
      sub: 'from last month',
    },
    {
      title: 'KYC Completed',
      value: apiStats?.kycCompleted ?? 0,
      icon: <CheckCircle2 size={20} />,
      color: '#10b981',
      bg: 'bg-green-50 dark:bg-green-950',
      change: apiStats?.kycRate ?? '0%',
      changeType: 'up' as const,
      sub: 'completion rate',
    },
    {
      title: 'Pending Approvals',
      value: apiStats?.pendingApprovals ?? 0,
      icon: <Clock size={20} />,
      color: '#ef4444',
      bg: 'bg-red-50 dark:bg-red-950',
      change: apiStats?.approvalChange ?? '0',
      changeType: 'down' as const,
      sub: 'from last month',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">HR Dashboard</Title>
        <Text type="secondary">Welcome back, Admin. Here's what's happening today.</Text>
      </div>

      <Spin spinning={statsLoading}>
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
                  <div className="text-2xl font-bold mt-0.5">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                  <Text type="secondary" className="text-xs">{stat.sub}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Employees" bordered={false}>
            <Table
              columns={columns}
              dataSource={employees}
              rowKey={(r: any) => r._id || r.key || r.id}
              pagination={false}
              size="middle"
              loading={employeesLoading}
              locale={{ emptyText: 'No employees found. Add your first employee!' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Recent Activity" bordered={false} className="h-full">
            <Spin spinning={activitiesLoading}>
              {activities.length > 0 ? (
                <List
                  dataSource={activities}
                  renderItem={(activity: any) => (
                    <List.Item className="!px-0">
                      <List.Item.Meta
                        avatar={
                          <Avatar size={36} className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <ShieldCheck className="text-blue-600" size={16} />
                          </Avatar>
                        }
                        title={<Text className="text-sm">{activity.title || activity.action || 'Activity'}</Text>}
                        description={<Text type="secondary" className="text-xs">{activity.time || activity.createdAt || ''}</Text>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">No recent activity</Text>
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
