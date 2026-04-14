import React, { useState } from 'react';
import { Card, Tag, Button, Input, Select, Progress, Row, Col, Typography, Space, Statistic } from 'antd';
import { App } from 'antd';
import { Plus, Search, BookOpen, CheckCircle2, Users, CalendarDays, Clock } from 'lucide-react';
import { useTrainingList } from '@/hooks/queries/useTraining';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  active: 'blue',
  completed: 'green',
  upcoming: 'orange',
  cancelled: 'red',
  draft: 'default',
};

const categoryColor: Record<string, string> = {
  technical: 'blue',
  soft_skills: 'purple',
  compliance: 'red',
  leadership: 'gold',
  onboarding: 'green',
};

const TrainingList: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HR_MANAGER;
  const isManager = isAdmin || currentUser?.role === UserRole.MANAGER;
  const isViewer = currentUser?.role === UserRole.VIEWER;

  const { data, isLoading } = useTrainingList({ status: statusFilter });

  const programs: any[] = data?.data ?? [];
  const filtered = programs.filter((p: any) =>
    p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.trainer?.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = [
    { title: 'Active Programs', value: programs.filter((p: any) => p.status === 'active').length, icon: <BookOpen size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Completed', value: programs.filter((p: any) => p.status === 'completed').length, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Total Participants', value: programs.reduce((sum: number, p: any) => sum + (p.enrolledCount ?? 0), 0), icon: <Users size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
    { title: 'Upcoming', value: programs.filter((p: any) => p.status === 'upcoming').length, icon: <CalendarDays size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('training')}</Title>
          <Text type="secondary">{t('manage_training')}</Text>
        </div>
        {isAdmin && <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/training/create')}>Create Program</Button>}
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="h-full hover:shadow-md transition-shadow" bordered={false}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
              </div>
              <div className="mt-4">
                <Text type="secondary" className="text-xs">{stat.title}</Text>
                <div className="text-2xl font-bold mt-0.5">{stat.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input prefix={<Search size={16} />} placeholder={`${t('search')}...`} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
          <Select placeholder="Filter by status" allowClear className="min-w-[150px]" value={statusFilter} onChange={setStatusFilter}
            options={['active', 'completed', 'upcoming', 'draft', 'cancelled'].map(s => ({ value: s, label: s }))} />
        </div>

        <Row gutter={[16, 16]}>
          {isLoading ? (
            <Col span={24}><Card loading bordered={false} /></Col>
          ) : filtered.length === 0 ? (
            <Col span={24}><Card bordered={false}><Text type="secondary">No training programs found.</Text></Card></Col>
          ) : (
            filtered.map((program: any) => (
              <Col key={program._id ?? program.id} xs={24} sm={12} lg={8}>
                <Card bordered={false} hoverable className="h-full">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Title level={5} className="!mb-0 !text-base">{program.title}</Title>
                      <Tag color={statusColor[program.status] ?? 'default'}>{program.status}</Tag>
                    </div>
                    {program.category && <Tag color={categoryColor[program.category] ?? 'default'}>{program.category}</Tag>}
                    <div className="space-y-1 text-sm">
                      {program.trainer && <div className="flex items-center gap-2 text-gray-500"><Users size={14} /> {program.trainer}</div>}
                      {program.duration && <div className="flex items-center gap-2 text-gray-500"><Clock size={14} /> {program.duration}</div>}
                    </div>
                    {program.maxParticipants && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Enrollment</span>
                          <span>{program.enrolledCount ?? 0}/{program.maxParticipants}</span>
                        </div>
                        <Progress percent={Math.round(((program.enrolledCount ?? 0) / program.maxParticipants) * 100)} size="small" showInfo={false} strokeColor="#3b82f6" />
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Card>

    </div>
  );
};

export default TrainingList;
