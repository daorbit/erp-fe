import React, { useState } from 'react';
import { Card, Tag, Button, Input, Drawer, Form, Select, Row, Col, Typography, Space, Avatar, Empty } from 'antd';
import { App } from 'antd';
import { Plus, Search, Pin, Megaphone, Eye } from 'lucide-react';
import { useAnnouncementList, useCreateAnnouncement, useMarkAnnouncementRead } from '@/hooks/queries/useAnnouncements';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const { Title, Text, Paragraph } = Typography;

const categoryColor: Record<string, string> = {
  general: 'blue', hr: 'purple', event: 'green', policy: 'orange', urgent: 'red',
};

const priorityColor: Record<string, string> = {
  low: 'default', normal: 'blue', high: 'orange', critical: 'red',
};

const AnnouncementList: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HR_MANAGER;
  const isManager = isAdmin || currentUser?.role === UserRole.MANAGER;
  const isViewer = currentUser?.role === UserRole.VIEWER;

  const { data, isLoading } = useAnnouncementList();
  const createMutation = useCreateAnnouncement();
  const markReadMutation = useMarkAnnouncementRead();

  const announcements: any[] = data?.data ?? [];
  const filtered = announcements.filter((a: any) =>
    a.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchText.toLowerCase())
  );

  const pinned = filtered.filter((a: any) => a.isPinned);
  const unpinned = filtered.filter((a: any) => !a.isPinned);

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Announcement created');
      form.resetFields();
      setDrawerOpen(false);
    } catch {
      message.error('Failed to create announcement');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch { /* silent */ }
  };

  const renderCard = (item: any) => (
    <Col key={item._id ?? item.id} xs={24} lg={12}>
      <Card bordered={false} hoverable className="h-full" onClick={() => handleMarkRead(item._id ?? item.id)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {item.isPinned && <Pin size={14} className="text-amber-500 shrink-0" />}
              <Title level={5} className="!mb-0 !text-base truncate">{item.title}</Title>
            </div>
            <Space size={4} className="shrink-0">
              {item.category && <Tag color={categoryColor[item.category] ?? 'default'}>{item.category}</Tag>}
              {item.priority && <Tag color={priorityColor[item.priority] ?? 'default'}>{item.priority}</Tag>}
            </Space>
          </div>
          <Paragraph className="!mb-0 text-gray-600" ellipsis={{ rows: 3 }}>{item.content}</Paragraph>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Avatar size={20} className="bg-blue-600 text-[10px]">{(item.postedBy?.name ?? item.postedBy ?? 'U').toString().charAt(0)}</Avatar>
              <span>{typeof item.postedBy === 'string' ? item.postedBy : item.postedBy?.name ?? 'Admin'}</span>
            </div>
            <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('announcements')}</Title>
          <Text type="secondary">{t('manage_announcements')}</Text>
        </div>
        {isAdmin && <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>{t('new_announcement')}</Button>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input prefix={<Search size={16} />} placeholder={`${t('search')}...`} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
      </div>

      {isLoading ? (
        <Row gutter={[16, 16]}>{[1, 2].map(i => <Col key={i} xs={24} lg={12}><Card loading bordered={false} /></Col>)}</Row>
      ) : filtered.length === 0 ? (
        <Card bordered={false}><Empty description="No announcements" /></Card>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-wider mb-3 block">Pinned</Text>
              <Row gutter={[16, 16]}>{pinned.map(renderCard)}</Row>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <Text type="secondary" className="text-xs uppercase tracking-wider mb-3 block">Recent</Text>}
              <Row gutter={[16, 16]}>{unpinned.map(renderCard)}</Row>
            </div>
          )}
        </>
      )}

      <Drawer title="New Announcement" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={500} footer={
        <div className="flex justify-end gap-3">
          <Button onClick={() => setDrawerOpen(false)}>{t('cancel')}</Button>
          <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>{t('submit')}</Button>
        </div>
      }>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Announcement title" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Category" options={['general', 'hr', 'event', 'policy', 'urgent'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select placeholder="Priority" options={['low', 'normal', 'high', 'critical'].map(p => ({ value: p, label: p }))} />
            </Form.Item>
          </div>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="Announcement content..." />
          </Form.Item>
          <Form.Item name="isPinned" label="Pin this announcement?" valuePropName="checked">
            <Select placeholder="No" options={[{ value: false, label: 'No' }, { value: true, label: 'Yes' }]} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AnnouncementList;
