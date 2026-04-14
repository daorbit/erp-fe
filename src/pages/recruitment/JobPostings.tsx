import React, { useState } from 'react';
import { Card, Table, Tag, Button, Typography, Row, Col, Space, Avatar } from 'antd';
import { App } from 'antd';
import { Briefcase, Users, Calendar, CheckCircle2, Plus, Edit2 } from 'lucide-react';
import { useJobList } from '@/hooks/queries/useRecruitment';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColor: Record<string, string> = {
  open: 'green',
  closed: 'red',
  draft: 'default',
  on_hold: 'orange',
};

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const { data: jobData, isLoading } = useJobList();

  const jobs: any[] = jobData?.data ?? [];

  const open = jobs.filter(j => j.status === 'open').length;
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || j.applications || 0), 0);
  const interviews = jobs.reduce((sum, j) => sum + (j.interviewCount || 0), 0);
  const hired = jobs.reduce((sum, j) => sum + (j.hiredCount || 0), 0);

  const stats = [
    { title: 'Open Positions', value: open, icon: <Briefcase size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Applications', value: totalApplications, icon: <Users size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Interviews', value: interviews, icon: <Calendar size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
    { title: 'Hired', value: hired, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
  ];

  const columns = [
    { title: t('name'), dataIndex: 'title', key: 'title', render: (v: string) => <span className="font-medium">{v}</span> },
    {
      title: t('department'), dataIndex: 'department', key: 'department',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: 'Vacancies', dataIndex: 'vacancies', key: 'vacancies' },
    { title: 'Applications', dataIndex: 'applicationCount', key: 'applicationCount', render: (v: number) => v || 0 },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Open', value: 'open' },
        { text: 'Closed', value: 'closed' },
        { text: 'Draft', value: 'draft' },
        { text: 'On Hold', value: 'on_hold' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    {
      title: t('actions'), key: 'actions',
      render: (_: any, r: any) => (
        <Button size="small" type="link" icon={<Edit2 size={14} />} onClick={() => navigate(`/recruitment/${r._id || r.id}/edit`)}>{t('edit')}</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('job_postings')}</Title>
          <Text type="secondary">{t('manage_recruitment')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/recruitment/create')}>{t('create_job')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">{stat.title}</Text>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={jobs} loading={isLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
      </Card>

    </div>
  );
};

export default JobPostings;
