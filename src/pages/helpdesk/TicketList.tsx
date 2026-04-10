import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Drawer, Form, Select, Row, Col, Typography, Space, Avatar, List, Divider } from 'antd';
import { App } from 'antd';
import { Plus, Search, AlertCircle, Clock, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { useTicketList, useCreateTicket, useAddTicketComment, useUpdateTicketStatus } from '@/hooks/queries/useHelpdesk';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  open: 'red', in_progress: 'orange', resolved: 'green', closed: 'default', pending: 'blue',
};
const priorityColor: Record<string, string> = {
  low: 'default', medium: 'blue', high: 'orange', critical: 'red',
};

const TicketList: React.FC = () => {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [comment, setComment] = useState('');
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data, isLoading } = useTicketList();
  const createMutation = useCreateTicket();
  const commentMutation = useAddTicketComment();
  const statusMutation = useUpdateTicketStatus();

  const tickets: any[] = data?.data ?? [];
  const filtered = tickets.filter((t: any) =>
    t.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
    t.ticketNumber?.toLowerCase().includes(searchText.toLowerCase())
  );

  const openCount = tickets.filter((t: any) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t: any) => t.status === 'in_progress').length;
  const resolvedToday = tickets.filter((t: any) => {
    if (t.status !== 'resolved' || !t.resolvedAt) return false;
    return new Date(t.resolvedAt).toDateString() === new Date().toDateString();
  }).length;

  const stats = [
    { title: 'Open', value: openCount, icon: <AlertCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
    { title: 'In Progress', value: inProgressCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Resolved Today', value: resolvedToday, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
  ];

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Ticket created');
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error('Failed to create ticket');
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !selectedTicket) return;
    try {
      await commentMutation.mutateAsync({ id: selectedTicket._id ?? selectedTicket.id, data: { content: comment } });
      message.success('Comment added');
      setComment('');
    } catch {
      message.error('Failed to add comment');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await statusMutation.mutateAsync({ id, data: { status } });
      message.success('Status updated');
    } catch {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'Ticket #', dataIndex: 'ticketNumber', key: 'ticketNumber', render: (t: string) => <Text code>{t}</Text> },
    {
      title: 'Subject', dataIndex: 'subject', key: 'subject',
      render: (_: any, r: any) => (
        <Button type="link" className="!p-0" onClick={() => { setSelectedTicket(r); setDetailOpen(true); }}>{r.subject}</Button>
      ),
    },
    {
      title: t('category'), dataIndex: 'category', key: 'category',
      filters: ['it', 'hr', 'admin', 'finance', 'facilities', 'other'].map(c => ({ text: c, value: c })),
      onFilter: (value: any, record: any) => record.category === value,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: t('priority'), dataIndex: 'priority', key: 'priority',
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value: any, record: any) => record.priority === value,
      render: (p: string) => <Tag color={priorityColor[p] ?? 'default'}>{p}</Tag>,
    },
    { title: t('employee'), dataIndex: 'employeeName', key: 'employeeName', responsive: ['lg'] as any },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo', render: (a: any) => a ? (typeof a === 'string' ? a : a.name ?? '-') : '-', responsive: ['lg'] as any },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Open', value: 'open' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] ?? 'default'}>{s}</Tag>,
    },
    {
      title: t('actions'), key: 'actions', width: 150,
      render: (_: any, r: any) => (
        <Select size="small" value={r.status} onChange={(v: string) => handleStatusChange(r._id ?? r.id, v)} className="min-w-[120px]"
          options={['open', 'in_progress', 'resolved', 'closed'].map(s => ({ value: s, label: s }))} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('helpdesk')}</Title>
          <Text type="secondary">{t('manage_helpdesk')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>{t('create_ticket')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, i) => (
          <Col key={i} xs={24} sm={8}>
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

      <Card bordered={false} className="overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <Input prefix={<Search size={16} />} placeholder={`${t('search')}...`} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
        </div>
        <Table columns={columns} dataSource={filtered} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 900 }} />
      </Card>

      {/* Create Drawer */}
      <Drawer title="New Ticket" open={createOpen} onClose={() => setCreateOpen(false)} width={500} footer={
        <div className="flex justify-end gap-3">
          <Button onClick={() => setCreateOpen(false)}>{t('cancel')}</Button>
          <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>{t('submit')}</Button>
        </div>
      }>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input placeholder="Ticket subject" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Category" options={['it', 'hr', 'admin', 'finance', 'facilities', 'other'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select placeholder="Priority" options={['low', 'medium', 'high', 'critical'].map(p => ({ value: p, label: p }))} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe your issue..." />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer title={selectedTicket?.subject ?? 'Ticket Detail'} open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedTicket(null); }} width={500}>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Tag color={statusColor[selectedTicket.status] ?? 'default'}>{selectedTicket.status}</Tag>
              <Tag color={priorityColor[selectedTicket.priority] ?? 'default'}>{selectedTicket.priority}</Tag>
              {selectedTicket.category && <Tag>{selectedTicket.category}</Tag>}
            </div>
            <div className="text-sm text-gray-600">{selectedTicket.description}</div>
            <div className="text-xs text-gray-400">
              Created: {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : '-'}
            </div>
            <Divider>Comments</Divider>
            <List
              dataSource={selectedTicket.comments ?? []}
              locale={{ emptyText: 'No comments yet' }}
              renderItem={(c: any) => (
                <List.Item className="!px-0">
                  <List.Item.Meta
                    avatar={<Avatar size={28} className="bg-blue-600 text-xs">{(c.author ?? 'U').toString().charAt(0)}</Avatar>}
                    title={<Text className="text-sm">{typeof c.author === 'string' ? c.author : c.author?.name ?? 'User'}</Text>}
                    description={<div><div className="text-sm">{c.content}</div><div className="text-xs text-gray-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div></div>}
                  />
                </List.Item>
              )}
            />
            <div className="flex gap-2">
              <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." onPressEnter={handleComment} />
              <Button type="primary" icon={<Send size={16} />} loading={commentMutation.isPending} onClick={handleComment} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TicketList;
