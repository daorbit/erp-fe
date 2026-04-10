import React from 'react';
import { Card, Table, Avatar, Tag, Typography, Row, Col, List, Spin, Progress } from 'antd';
import {
  Users, CheckCircle2, Clock, UserPlus,
  ArrowUpRight, Briefcase, CalendarCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useDashboardStats, useRecentActivities, useDepartmentDistribution } from '@/hooks/queries/useDashboard';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/AnimateIn';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { colorPalettes, type ThemeColor } from '@/config/theme';

const { Title, Text } = Typography;

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
  completed: 'green', in_progress: 'orange', pending: 'gold', active: 'green', inactive: 'red',
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
          <Avatar size={36} className="!bg-gradient-to-br !from-blue-500 !to-indigo-600 !text-white !text-xs !font-semibold">
            {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
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
  const { t } = useTranslation();
  const themeColor = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const palette = colorPalettes[themeColor] || colorPalettes.blue;
  const primaryColor = palette.primary;

  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities();
  const { data: employeeData, isLoading: employeesLoading } = useEmployeeList({ limit: '5' });
  const { data: deptData } = useDepartmentDistribution();

  const apiStats = statsData?.data;
  const employees = employeeData?.data ?? [];
  const activities = activitiesData?.data ?? [];
  const rawDeptData = deptData?.data;
  const departmentData = rawDeptData?.length
    ? rawDeptData.map((d: any) => ({ name: d.department || d.name, value: d.count ?? d.value ?? 0 }))
    : fallbackDeptData;
  const monthlyData = fallbackMonthlyData;

  const PIE_COLORS = [primaryColor, palette.colors[1], palette.colors[2], '#f59e0b', '#8b5cf6'];

  const presentToday = apiStats?.todayAttendance?.present ?? 0;
  const totalEmp = apiStats?.totalEmployees ?? 0;
  const attendanceRate = totalEmp > 0 ? Math.round((presentToday / totalEmp) * 100) : 0;

  const stats = [
    {
      title: t('total_employees'),
      value: apiStats?.totalEmployees ?? 0,
      icon: <Users size={22} />,
      subtitle: `${apiStats?.totalDepartments ?? 0} ${t('departments')}`,
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('present_today'),
      value: presentToday,
      icon: <CheckCircle2 size={22} />,
      subtitle: `${attendanceRate}% ${t('attendance')}`,
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('pending_leaves'),
      value: apiStats?.pendingLeaves ?? 0,
      icon: <Clock size={22} />,
      subtitle: `${apiStats?.upcomingHolidays ?? 0} ${t('upcoming_holidays')}`,
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: t('recent_hires'),
      value: apiStats?.recentHires ?? 0,
      icon: <UserPlus size={22} />,
      subtitle: `${apiStats?.pendingPayroll ?? 0} ${t('pending_payroll')}`,
      lightBg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  const quickStats = [
    { label: t('attendance_today'), value: `${attendanceRate}%`, icon: <CalendarCheck size={16} /> },
    { label: t('announcements'), value: `${apiStats?.activeAnnouncements ?? 0}`, icon: <Briefcase size={16} /> },
    { label: t('pending_leaves'), value: `${apiStats?.pendingLeaves ?? 0}`, icon: <Clock size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <AnimateIn variant="fadeIn">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Title level={4} className="!mb-0">{t('dashboard')}</Title>
            <Text type="secondary">{t('welcome_back')}. {t('heres_whats_happening')}</Text>
          </div>
          <div className="flex items-center gap-3">
            {quickStats.map((qs, i) => (
              <div key={i} className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-400">{qs.icon}</span>
                <span className="text-xs text-gray-500">{qs.label}</span>
                <span className="text-sm font-bold">{qs.value}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimateIn>

      {/* Stat Cards */}
      <Spin spinning={statsLoading}>
        <StaggerContainer>
          <Row gutter={[16, 16]}>
            {stats.map((stat, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <StaggerItem>
                  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Card bordered={false} className="!rounded-xl !shadow-sm hover:!shadow-md transition-shadow" styles={{ body: { padding: 20 } }}>
                      <div className={`w-11 h-11 rounded-xl ${stat.lightBg} flex items-center justify-center`}>
                        <span className={stat.iconColor}>{stat.icon}</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{stat.title}</div>
                        <div className="text-2xl font-bold mt-1">
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{stat.subtitle}</div>
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
            <Card
              title={<span className="font-semibold">Employee Trends</span>}
              extra={<Tag color="blue">2024</Tag>}
              bordered={false}
              className="!rounded-xl !shadow-sm"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="joinedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RTooltip />
                  <Area type="monotone" dataKey="joined" name="Joined" stroke={primaryColor} fill="url(#joinedGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="left" name="Left" stroke="#f59e0b" fill="url(#leftGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.3}>
            <Card
              title={<span className="font-semibold">Department Distribution</span>}
              bordered={false}
              className="!rounded-xl !shadow-sm h-full"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {departmentData.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </AnimateIn>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.35}>
            <Card
              title={<span className="font-semibold">Recent Employees</span>}
              extra={<a className="text-xs flex items-center gap-1">View All <ArrowUpRight size={12} /></a>}
              bordered={false}
              className="!rounded-xl !shadow-sm"
            >
              <Table
                columns={columns}
                dataSource={employees}
                rowKey={(r: any) => r._id || r.key || r.id}
                pagination={false}
                size="middle"
                loading={employeesLoading}
                locale={{ emptyText: 'No employees found. Add your first employee!' }}
                scroll={{ x: 600 }}
              />
            </Card>
          </AnimateIn>
        </Col>

        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.4}>
            <Card
              title={<span className="font-semibold">Recent Activity</span>}
              bordered={false}
              className="!rounded-xl !shadow-sm h-full"
            >
              <Spin spinning={activitiesLoading}>
                {activities.length > 0 ? (
                  <List
                    dataSource={activities}
                    renderItem={(activity: any) => (
                      <List.Item className="!px-0">
                        <List.Item.Meta
                          avatar={
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                              <CheckCircle2 className="text-blue-500" size={14} />
                            </div>
                          }
                          title={<Text className="!text-sm">{activity.title || activity.action || 'Activity'}</Text>}
                          description={<Text type="secondary" className="!text-xs">{activity.time || activity.createdAt || ''}</Text>}
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
