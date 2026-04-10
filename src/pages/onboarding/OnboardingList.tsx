import React from 'react';
import { Card, Table, Avatar, Tag, Progress, Button, Typography, Row, Col } from 'antd';
import { Eye, UserPlus, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { completed: 'green', in_progress: 'orange', pending: 'gold', rejected: 'red' };

const OnboardingList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: empData, isLoading } = useEmployeeList({ onboarding: 'true' });
  const records: any[] = empData?.data ?? [];

  const totalCount = records.length;
  const completedCount = records.filter((r: any) => r.kycStatus === 'completed' || r.onboardingStatus === 'completed').length;
  const inProgressCount = records.filter((r: any) => r.kycStatus === 'in_progress' || r.onboardingStatus === 'in_progress').length;
  const pendingCount = records.filter((r: any) => r.kycStatus === 'pending' || r.onboardingStatus === 'pending').length;

  const stats = [
    { title: t('onboarding'), value: totalCount, icon: <Users size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: t('kyc_completed'), value: completedCount, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('pending_onboarding'), value: inProgressCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: t('pending_approvals'), value: pendingCount, icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  const columns = [
    {
      title: t('employee'), dataIndex: 'name', key: 'name',
      render: (_: any, r: any) => {
        const name = r.name || `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600">{name.split(' ').map((n: string) => n[0]).join('')}</Avatar>
            <div><div className="font-medium">{name}</div><div className="text-xs text-gray-400">{r.email}</div></div>
          </div>
        );
      },
    },
    { title: t('department'), dataIndex: 'department', key: 'department', render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : (d || '-')}</Tag> },
    { title: 'Start Date', key: 'startDate', render: (_: any, r: any) => { const d = r.startDate || r.joinDate; return d ? new Date(d).toLocaleDateString() : '-'; } },
    { title: 'Current Step', dataIndex: 'step', key: 'step', render: (s: string) => <Text type="secondary">{s || '-'}</Text> },
    {
      title: t('status'), key: 'kycStatus',
      render: (_: any, r: any) => {
        const status = r.kycStatus || r.onboardingStatus || 'pending';
        return <Tag color={statusColor[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Progress', key: 'kycProgress',
      render: (_: any, r: any) => {
        const val = r.kycProgress ?? r.onboardingProgress ?? 0;
        return (
          <div className="flex items-center gap-2 w-[130px]">
            <Progress percent={val} size="small" showInfo={false} strokeColor={val === 100 ? '#10b981' : '#3b82f6'} />
            <span className="text-xs text-gray-500">{val}%</span>
          </div>
        );
      },
    },
    {
      title: t('actions'), key: 'actions',
      render: (_: any, r: any) => <Button type="link" icon={<Eye size={14} />} size="small" onClick={() => navigate(`/employees/${r._id || r.id}`)}>{t('view')}</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Title level={4} className="!mb-1">{t('onboarding_list')}</Title><Text type="secondary">{t('pending_onboarding')}</Text></div>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => navigate('/onboarding/new')}>New Onboarding</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">{s.title}</Text>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={records} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default OnboardingList;
