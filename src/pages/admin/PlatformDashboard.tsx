import React from 'react';
import { Card, Table, Avatar, Tag, Typography, Row, Col, Spin } from 'antd';
import {
  Building2, Users, UserCheck, FolderTree, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  usePlatformStats, useCompanyOverviews, useCompanyGrowth, useUserDistribution,
} from '@/hooks/queries/useDashboard';
import AnimateIn, { StaggerContainer, StaggerItem } from '@/components/AnimateIn';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { colorPalettes, type ThemeColor } from '@/config/theme';

const { Title, Text } = Typography;

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1'];

const PlatformDashboard: React.FC = () => {
  const { t } = useTranslation();
  const themeColor = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const palette = colorPalettes[themeColor] || colorPalettes.blue;
  const primaryColor = palette.primary;

  const { data: statsData, isLoading: statsLoading } = usePlatformStats();
  const { data: overviewsData, isLoading: overviewsLoading } = useCompanyOverviews();
  const { data: growthData } = useCompanyGrowth();
  const { data: distributionData } = useUserDistribution();

  const stats = statsData?.data;
  const companyOverviews: any[] = overviewsData?.data ?? [];
  const companyGrowth: any[] = growthData?.data ?? [];
  const userDistribution: any[] = distributionData?.data ?? [];

  const statCards = [
    {
      title: t('total_companies'),
      value: stats?.totalCompanies ?? 0,
      icon: <Building2 size={22} />,
      subtitle: `${stats?.activeCompanies ?? 0} ${t('active')}`,
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('total_users'),
      value: stats?.totalUsers ?? 0,
      icon: <Users size={22} />,
      subtitle: `${stats?.roleDistribution?.admins ?? 0} ${t('company_admins')}`,
      lightBg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      title: t('total_employees'),
      value: stats?.totalEmployeeProfiles ?? 0,
      icon: <UserCheck size={22} />,
      subtitle: `${stats?.totalDepartments ?? 0} ${t('departments')}`,
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('new_companies'),
      value: stats?.recentCompanies ?? 0,
      icon: <TrendingUp size={22} />,
      subtitle: t('last_30_days'),
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const companyColumns = [
    {
      title: t('company'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar shape="square" size={36} src={record.logo} className="!bg-gradient-to-br !from-blue-500 !to-indigo-600 !text-white !text-xs !font-semibold">
            {name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </Avatar>
          <div>
            <div className="font-medium text-sm">{name}</div>
            <div className="text-xs text-gray-400">{record.industry || record.code}</div>
          </div>
        </div>
      ),
    },
    { title: t('company_code'), dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: t('total_users'), dataIndex: 'userCount', key: 'userCount', sorter: (a: any, b: any) => a.userCount - b.userCount },
    { title: t('departments'), dataIndex: 'departmentCount', key: 'departmentCount' },
    {
      title: t('status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? t('active') : t('inactive')}</Tag>,
    },
  ];

  // Transform userDistribution for pie chart
  const pieData = userDistribution.map((d: any) => ({ name: d.company, value: d.users }));

  return (
    <div className="space-y-6">
      <AnimateIn variant="fadeIn">
        <div>
          <Title level={4} className="!mb-0">{t('platform_dashboard')}</Title>
          <Text type="secondary">{t('platform_overview')}</Text>
        </div>
      </AnimateIn>

      {/* Stat Cards */}
      <Spin spinning={statsLoading}>
        <StaggerContainer>
          <Row gutter={[16, 16]}>
            {statCards.map((stat, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <StaggerItem>
                  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <Card bordered={false} className="!rounded-xl !shadow-sm hover:!shadow-md transition-shadow" styles={{ body: { padding: 20 } }}>
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl ${stat.lightBg} flex items-center justify-center`}>
                          <span className={stat.iconColor}>{stat.icon}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{stat.title}</div>
                        <div className="text-2xl font-bold mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
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
              title={<span className="font-semibold">{t('company_growth')}</span>}
              extra={<Tag color="blue">{t('last_12_months')}</Tag>}
              bordered={false}
              className="!rounded-xl !shadow-sm"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RTooltip />
                  <Bar dataKey="companies" name={t('companies')} fill={primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.3}>
            <Card
              title={<span className="font-semibold">{t('users_by_company')}</span>}
              bordered={false}
              className="!rounded-xl !shadow-sm h-full"
            >
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <Text type="secondary">{t('no_data')}</Text>
                </div>
              )}
            </Card>
          </AnimateIn>
        </Col>
      </Row>

      {/* Company Overview Table */}
      <AnimateIn variant="fadeUp" delay={0.35}>
        <Card
          title={<span className="font-semibold">{t('company_overview')}</span>}
          extra={<a href="/admin/companies" className="text-xs flex items-center gap-1">{t('view_all')} <ArrowUpRight size={12} /></a>}
          bordered={false}
          className="!rounded-xl !shadow-sm"
        >
          <Table
            columns={companyColumns}
            dataSource={companyOverviews}
            rowKey={(r: any) => r._id || r.id}
            pagination={false}
            size="middle"
            loading={overviewsLoading}
            locale={{ emptyText: t('no_companies_yet') }}
            scroll={{ x: 700 }}
          />
        </Card>
      </AnimateIn>

      {/* Role Distribution */}
      {stats?.roleDistribution && (
        <AnimateIn variant="fadeUp" delay={0.4}>
          <Row gutter={[16, 16]}>
            {[
              { label: t('company_admins'), value: stats.roleDistribution.admins, color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
              { label: t('hr_managers'), value: stats.roleDistribution.hrManagers, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
              { label: t('managers'), value: stats.roleDistribution.managers, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
              { label: t('employees_role'), value: stats.roleDistribution.employees, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
            ].map((item, i) => (
              <Col key={i} xs={12} sm={6}>
                <Card bordered={false} className="!rounded-xl !shadow-sm" styles={{ body: { padding: 16 } }}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</div>
                  <div className="text-xl font-bold mt-1">{item.value}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </AnimateIn>
      )}
    </div>
  );
};

export default PlatformDashboard;
