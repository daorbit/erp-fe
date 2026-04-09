import React, { useState } from 'react';
import { Card, Table, Tag, Button, Drawer, Form, Input, InputNumber, Select, Typography, Row, Col, Space, Avatar } from 'antd';
import { App } from 'antd';
import { Briefcase, Users, Calendar, CheckCircle2, Plus, Edit2 } from 'lucide-react';
import { useJobList, useCreateJob, useUpdateJob } from '@/hooks/queries/useRecruitment';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColor: Record<string, string> = {
  open: 'green',
  closed: 'red',
  draft: 'default',
  on_hold: 'orange',
};

const JobPostings: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: jobData, isLoading } = useJobList();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

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
    { title: 'Title', dataIndex: 'title', key: 'title', render: (v: string) => <span className="font-medium">{v}</span> },
    {
      title: 'Department', dataIndex: 'department', key: 'department',
      filters: ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'Operations'].map(d => ({ text: d, value: d })),
      onFilter: (value: any, record: any) => record.department === value,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    { title: 'Vacancies', dataIndex: 'vacancies', key: 'vacancies' },
    { title: 'Applications', dataIndex: 'applicationCount', key: 'applicationCount', render: (v: number) => v || 0 },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
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
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Button size="small" type="link" icon={<Edit2 size={14} />} onClick={() => { setEditingJob(r); form.setFieldsValue(r); setDrawerOpen(true); }}>Edit</Button>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob._id || editingJob.id, data: values }, {
        onSuccess: () => { message.success('Job updated'); closeDrawer(); },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: () => { message.success('Job created'); closeDrawer(); },
      });
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingJob(null);
    form.resetFields();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Job Postings</Title>
          <Text type="secondary">Manage open positions and recruitment</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>Create Job</Button>
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
        <Table columns={columns} dataSource={jobs} loading={isLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title={editingJob ? 'Edit Job' : 'Create Job'} open={drawerOpen} onClose={closeDrawer} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Senior Software Engineer" />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select placeholder="Select department" options={['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'Operations'].map(d => ({ value: d, label: d }))} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="vacancies" label="Vacancies" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select placeholder="Status" options={[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'draft', label: 'Draft' },
                { value: 'on_hold', label: 'On Hold' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Job description..." />
          </Form.Item>
          <Form.Item name="requirements" label="Requirements">
            <TextArea rows={3} placeholder="Requirements..." />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingJob ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default JobPostings;
