import React, { useState } from 'react';
import { Card, Tag, Button, Table, Tabs, Row, Col, Typography, Space, Descriptions, Avatar, Progress } from 'antd';
import { App } from 'antd';
import { ArrowLeft, Users, Clock, CalendarDays, UserPlus, BookOpen } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTraining } from '@/hooks/queries/useTraining';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  active: 'blue', completed: 'green', upcoming: 'orange', cancelled: 'red', draft: 'default',
};

const TrainingDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data, isLoading } = useTraining(id!);

  const program: any = data?.data ?? {};
  const participants: any[] = program.participants ?? [];

  const participantColumns = [
    {
      title: t('employee'), dataIndex: 'name', key: 'name',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">{(r.name ?? r.employeeName ?? 'U').split(' ').map((n: string) => n[0]).join('')}</Avatar>
          <div>
            <div className="font-medium">{r.name ?? r.employeeName}</div>
            <div className="text-xs text-gray-400">{r.email ?? r.employeeEmail}</div>
          </div>
        </div>
      ),
    },
    { title: t('department'), dataIndex: 'department', key: 'department', render: (d: string) => d ? <Tag>{d}</Tag> : '-' },
    { title: 'Enrolled Date', dataIndex: 'enrolledDate', key: 'enrolledDate', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'dropped' ? 'red' : 'blue'}>{s ?? 'enrolled'}</Tag>,
    },
    {
      title: 'Progress', dataIndex: 'progress', key: 'progress',
      render: (val: number) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress percent={val ?? 0} size="small" showInfo={false} strokeColor={(val ?? 0) === 100 ? '#10b981' : '#3b82f6'} className="flex-1" />
          <span className="text-xs text-gray-500 w-9 text-right">{val ?? 0}%</span>
        </div>
      ),
    },
  ];

  const infoCards = [
    { label: 'Category', value: program.category, icon: <BookOpen size={16} /> },
    { label: 'Trainer', value: program.trainer, icon: <Users size={16} /> },
    { label: 'Duration', value: program.duration, icon: <Clock size={16} /> },
    { label: 'Start Date', value: program.startDate ? new Date(program.startDate).toLocaleDateString() : '-', icon: <CalendarDays size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} />
          <div>
            <Title level={4} className="!mb-1">{program.title ?? 'Training Detail'}</Title>
            <Space>
              <Text type="secondary">{t('training')}</Text>
              {program.status && <Tag color={statusColor[program.status] ?? 'default'}>{program.status}</Tag>}
            </Space>
          </div>
        </div>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => navigate(`/training/${id}/enroll`)}>Enroll Employee</Button>
      </div>

      <Row gutter={[16, 16]}>
        {infoCards.map((card, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false} className="h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">{card.icon}</div>
                <div>
                  <Text type="secondary" className="text-xs">{card.label}</Text>
                  <div className="font-medium">{card.value ?? '-'}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} loading={isLoading}>
        <Tabs items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="space-y-4">
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Max Participants">{program.maxParticipants ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Enrolled">{program.enrolledCount ?? participants.length}</Descriptions.Item>
                  <Descriptions.Item label="Start Date">{program.startDate ? new Date(program.startDate).toLocaleDateString() : '-'}</Descriptions.Item>
                  <Descriptions.Item label="End Date">{program.endDate ? new Date(program.endDate).toLocaleDateString() : '-'}</Descriptions.Item>
                </Descriptions>
                {program.description && (
                  <div>
                    <Text strong>Description</Text>
                    <p className="mt-1 text-gray-600">{program.description}</p>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'participants',
            label: `Participants (${participants.length})`,
            children: (
              <Table columns={participantColumns} dataSource={participants} rowKey={(r: any) => r._id ?? r.id ?? r.employeeId} pagination={{ pageSize: 10 }} size="middle" loading={isLoading} scroll={{ x: 700 }} />
            ),
          },
        ]} />
      </Card>

    </div>
  );
};

export default TrainingDetail;
