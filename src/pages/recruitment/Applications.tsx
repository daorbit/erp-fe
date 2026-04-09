import React, { useState } from 'react';
import { Card, Table, Tag, Button, Drawer, Descriptions, Select, Rate, Typography, Row, Col, Space, Avatar, Form, DatePicker, Input } from 'antd';
import { App } from 'antd';
import { FileText, Users, Calendar, CheckCircle2, Eye, Star } from 'lucide-react';
import { useApplicationList, useUpdateApplicationStatus, useScheduleInterview } from '@/hooks/queries/useRecruitment';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  applied: 'blue',
  screening: 'cyan',
  interview: 'orange',
  offered: 'purple',
  hired: 'green',
  rejected: 'red',
};

const allStatuses = ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'];

const Applications: React.FC = () => {
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [interviewForm] = Form.useForm();
  const { message } = App.useApp();

  const { data: appData, isLoading } = useApplicationList();
  const updateStatusMutation = useUpdateApplicationStatus();
  const scheduleMutation = useScheduleInterview();

  const applications: any[] = appData?.data ?? [];

  const pipeline = allStatuses.map(status => ({
    status,
    count: applications.filter(a => a.status === status).length,
  }));

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, data: { status } }, {
      onSuccess: () => message.success(`Status updated to ${status}`),
    });
  };

  const handleScheduleInterview = (values: any) => {
    if (!selectedApp) return;
    scheduleMutation.mutate({ id: selectedApp._id || selectedApp.id, data: { ...values, date: values.date?.format('YYYY-MM-DD HH:mm') } }, {
      onSuccess: () => {
        message.success('Interview scheduled');
        interviewForm.resetFields();
      },
    });
  };

  const columns = [
    {
      title: 'Candidate', dataIndex: 'candidateName', key: 'candidateName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.candidateName || 'U').charAt(0)}</Avatar>
          <div>
            <div className="font-medium text-sm">{r.candidateName}</div>
            <div className="text-xs text-gray-400">{r.jobTitle}</div>
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', responsive: ['md'] as any },
    { title: 'Experience', dataIndex: 'experience', key: 'experience', render: (v: number) => v ? `${v} yrs` : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (v: number) => <Rate disabled defaultValue={v || 0} count={5} className="text-sm" /> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" type="link" icon={<Eye size={14} />} onClick={() => { setSelectedApp(r); setDetailDrawerOpen(true); }}>View</Button>
          <Select size="small" value={r.status} onChange={(val) => handleStatusChange(r._id || r.id, val)} className="min-w-[100px]"
            options={allStatuses.map(s => ({ value: s, label: s }))} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Applications</Title>
        <Text type="secondary">Manage job applications and candidates</Text>
      </div>

      <Row gutter={[16, 16]}>
        {pipeline.map((p, i) => (
          <Col key={i} xs={12} sm={8} lg={4}>
            <Card bordered={false} className="text-center">
              <Tag color={statusColor[p.status]} className="!text-lg !px-3 !mb-2">{p.count}</Tag>
              <div className="text-xs text-gray-500 capitalize">{p.status}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={applications} loading={isLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title="Application Details" open={detailDrawerOpen} onClose={() => { setDetailDrawerOpen(false); setSelectedApp(null); }} width={520}>
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="bg-blue-600" size={48}>{(selectedApp.candidateName || 'U').charAt(0)}</Avatar>
              <div>
                <Title level={5} className="!mb-0">{selectedApp.candidateName}</Title>
                <Text type="secondary">{selectedApp.email}</Text>
              </div>
            </div>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Job">{selectedApp.jobTitle}</Descriptions.Item>
              <Descriptions.Item label="Experience">{selectedApp.experience ? `${selectedApp.experience} years` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={statusColor[selectedApp.status]}>{selectedApp.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Rating"><Rate disabled defaultValue={selectedApp.rating || 0} count={5} /></Descriptions.Item>
              <Descriptions.Item label="Applied On">{selectedApp.appliedDate || selectedApp.createdAt}</Descriptions.Item>
            </Descriptions>

            <Card title="Change Status" size="small">
              <Select className="w-full" value={selectedApp.status} onChange={(val) => handleStatusChange(selectedApp._id || selectedApp.id, val)}
                options={allStatuses.map(s => ({ value: s, label: s }))} />
            </Card>

            {selectedApp.status === 'screening' && (
              <Card title="Schedule Interview" size="small">
                <Form form={interviewForm} layout="vertical" onFinish={handleScheduleInterview}>
                  <Form.Item name="date" label="Date & Time" rules={[{ required: true }]}>
                    <DatePicker showTime className="w-full" />
                  </Form.Item>
                  <Form.Item name="interviewer" label="Interviewer">
                    <Input placeholder="Interviewer name" />
                  </Form.Item>
                  <Form.Item name="notes" label="Notes">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={scheduleMutation.isPending} block>Schedule</Button>
                </Form>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Applications;
