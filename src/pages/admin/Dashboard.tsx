import React from 'react';
import { Card, Table, Avatar, Tag, Typography, Row, Col, List, Spin } from 'antd';
import {
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useDashboardStats, useRecentActivities, useDepartmentDistribution } from '@/hooks/queries/useDashboard';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/AnimateIn';

const { Title, Text } = Typography;

const PIE_COLORS = ['#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

const fallbackMonthlyData = [
  { month: 'Jan', joined: 12, left: 3 },
  { month: 'Feb', joined: 15, left: 5 },
  { month: 'Mar', joined: 8, left: 2 },
  { month: 'Apr', joined: 20, left: 4 },
  { month: 'May', joined: 18, left: 6 },
  { month: 'Jun', joined: 22, left: 3 },
  { month: 'Jul', joined: 14, left: 5 },
  { month: 'Aug', joined: 16, left: 4 },
  { month: 'Sep', joined: 19, left: 7 },
  { month: 'Oct', joined: 24, left: 5 },
  { month: 'Nov', joined: 21, left: 3 },
  { month: 'Dec', joined: 17, left: 6 },
];

const fallbackDeptData = [
  { name: 'Engineering', value: 85 },
  { name: 'Marketing', value: 40 },
  { name: 'Sales', value: 35 },
  { name: 'HR', value: 20 },
  { name: 'Finance', value: 25 },
];

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
  const { data: deptData } = useDepartmentDistribution();

  const apiStats = statsData?.data;
  const employees = employeeData?.data ?? [];
  const activities = activitiesData?.data ?? [];
  const departmentData = deptData?.data ?? fallbackDeptData;
  const monthlyData = fallbackMonthlyData;

  const stats = [
    {
      title: 'Total Employees',
      value: apiStats?.totalEmployees ?? 248,
      icon: <Users size={20} />,
      change: apiStats?.employeeChange ?? '+20.9%',
      changeType: 'up' as const,
      sub: 'Employees in Last Month',
      large: true,
    },
    {
      title: 'Pending Onboarding',
      value: apiStats?.pendingOnboarding ?? 12,
      icon: <UserPlus size={20} />,
      change: apiStats?.onboardingChange ?? '+5.2%',
      changeType: 'up' as const,
      sub: 'New hires this month',
      large: true,
    },
    {
      title: 'KYC Completed',
      value: apiStats?.kycCompleted ?? 196,
      icon: <CheckCircle2 size={20} />,
      change: apiStats?.kycRate ?? '92%',
      changeType: 'up' as const,
      sub: 'Completion rate',
      large: false,
    },
    {
      title: 'Pending Approvals',
      value: apiStats?.pendingApprovals ?? 8,
      icon: <Clock size={20} />,
      change: apiStats?.approvalChange ?? '-12%',
      changeType: 'down' as const,
      sub: 'From last month',
      large: false,
    },
  ];

  return (
    <div className="space-y-6">
      <AnimateIn variant="fadeIn">
        <div>
          <Title level={4} className="!mb-1">HR Dashboard</Title>
          <Text type="secondary">Welcome back, Admin. Here's what's happening today.</Text>
        </div>
      </AnimateIn>

      {/* Stat Cards */}
      <Spin spinning={statsLoading}>
        <StaggerContainer>
          <Row gutter={[16, 16]}>
            {stats.map((stat, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Card
                      className={`h-full border-0 shadow-md ${
                        stat.large
                          ? 'bg-gradient-to-br from-emerald-800 to-emerald-600'
                          : 'bg-gradient-to-br from-emerald-700 to-emerald-500'
                      }`}
                      bordered={false}
                      styles={{ body: { padding: 20 } }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                          <span className="text-white">{stat.icon}</span>
                        </div>
                        <Tag
                          className="!bg-emerald-500/30 !text-white !border-0 !rounded-full !text-xs !px-2 !m-0"
                        >
                          {stat.changeType === 'up' ? (
                            <TrendingUp size={12} className="inline mr-1" />
                          ) : (
                            <TrendingDown size={12} className="inline mr-1" />
                          )}
                          {stat.change}
                        </Tag>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-white/70">{stat.title}</div>
                        <div className="text-3xl font-bold text-white mt-1">
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                        <div className="text-xs text-white/50 mt-1">{stat.sub}</div>
                      </div>
                    </Card>
                  </motion.div>
                </StaggerItem>
              </Col>
            ))}
          </Row>
        </StaggerContainer>
      </Spin>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.2}>
            <Card title="Employee Trends" bordered={false} className="shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RTooltip />
                  <Bar dataKey="joined" name="Joined" fill="#047857" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="left" name="Left" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.3}>
            <Card title="Department Distribution" bordered={false} className="shadow-sm h-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {departmentData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </AnimateIn>
        </Col>
      </Row>

      {/* Bottom Section: Table + Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.35}>
            <Card title="Recent Employees" bordered={false} className="shadow-sm">
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
          </AnimateIn>
        </Col>

        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.4}>
            <Card title="Recent Activity" bordered={false} className="shadow-sm h-full">
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
          </AnimateIn>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
