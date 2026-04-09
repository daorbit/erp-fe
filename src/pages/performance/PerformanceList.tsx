import React, { useState } from 'react';
import { Card, Table, Tag, Button, Tabs, Drawer, Form, Input, Select, Progress, Typography, Row, Col, Space, Avatar, Rate } from 'antd';
import { App } from 'antd';
import { Target, Star, Plus } from 'lucide-react';
import { useReviewList, useGoalList, useCreateGoal } from '@/hooks/queries/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const priorityColor: Record<string, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
};

const reviewTypeColor: Record<string, string> = {
  annual: 'purple',
  quarterly: 'blue',
  probation: 'orange',
  mid_year: 'cyan',
};

const PerformanceList: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('reviews');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: reviewData, isLoading: reviewsLoading } = useReviewList();
  const { data: goalData, isLoading: goalsLoading } = useGoalList();
  const createGoalMutation = useCreateGoal();

  const reviews: any[] = reviewData?.data ?? [];
  const goals: any[] = goalData?.data ?? [];

  const reviewColumns = [
    {
      title: t('employee'), dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <div>
            <div className="font-medium text-sm">{r.employeeName}</div>
            <div className="text-xs text-gray-400">{r.department}</div>
          </div>
        </div>
      ),
    },
    { title: t('type'), dataIndex: 'type', key: 'type', render: (v: string) => <Tag color={reviewTypeColor[v]}>{v}</Tag> },
    { title: 'Period', dataIndex: 'period', key: 'period' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (v: number) => v ? <Rate disabled defaultValue={v} count={5} className="text-sm" /> : <Text type="secondary">-</Text> },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
    {
      title: t('actions'), key: 'actions',
      render: (_: any, r: any) => (
        <Button size="small" type="link" href={`/performance/review/${r._id || r.id}`}>
          {r.status === 'draft' || r.status === 'pending' ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];

  const goalColumns = [
    {
      title: t('employee'), dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <span className="font-medium text-sm">{r.employeeName}</span>
        </div>
      ),
    },
    { title: 'Goal', dataIndex: 'title', key: 'title', render: (v: string) => <span className="font-medium">{v}</span> },
    {
      title: 'Progress', dataIndex: 'progress', key: 'progress',
      render: (v: number) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress percent={v || 0} size="small" showInfo={false} strokeColor={v === 100 ? '#10b981' : '#3b82f6'} className="flex-1" />
          <span className="text-xs text-gray-500 w-9 text-right">{v || 0}%</span>
        </div>
      ),
    },
    { title: t('priority'), dataIndex: 'priority', key: 'priority', render: (v: string) => <Tag color={priorityColor[v]}>{v}</Tag> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
  ];

  const handleCreateGoal = (values: any) => {
    const payload: any = {
      employee: values.employeeId,
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    createGoalMutation.mutate(payload, {
      onSuccess: () => {
        message.success('Goal created');
        setGoalModalOpen(false);
        form.resetFields();
      },
    });
  };

  const tabItems = [
    {
      key: 'reviews',
      label: 'Reviews',
      children: (
        <Card bordered={false}>
          <Table columns={reviewColumns} dataSource={reviews} loading={reviewsLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'goals',
      label: 'Goals',
      children: (
        <Card bordered={false} extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setGoalModalOpen(true)}>Add Goal</Button>}>
          <Table columns={goalColumns} dataSource={goals} loading={goalsLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">{t('performance')}</Title>
        <Text type="secondary">{t('manage_performance')}</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Drawer title={t('add')} open={goalModalOpen} onClose={() => setGoalModalOpen(false)} width={520} destroyOnClose extra={<Space><Button onClick={() => setGoalModalOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={createGoalMutation.isPending} onClick={() => form.submit()}>{t('submit')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleCreateGoal}>
          <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Complete project milestone" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe the goal..." />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Category" options={[
              { value: 'performance', label: 'Performance' },
              { value: 'learning', label: 'Learning' },
              { value: 'project', label: 'Project' },
              { value: 'behavioral', label: 'Behavioral' },
            ]} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select placeholder="Priority" options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]} />
            </Form.Item>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
            <Input placeholder="Employee ID" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PerformanceList;
