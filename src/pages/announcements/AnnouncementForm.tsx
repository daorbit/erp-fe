import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateAnnouncement } from '@/hooks/queries/useAnnouncements';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const AnnouncementForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const createMutation = useCreateAnnouncement();

  const handleSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Announcement created');
      navigate('/announcements');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/announcements')} />
        <Title level={4} className="!mb-0">New Announcement</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
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
          <Form.Item name="isPinned" label="Pin this announcement?">
            <Select placeholder="No" options={[{ value: false, label: 'No' }, { value: true, label: 'Yes' }]} />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/announcements')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AnnouncementForm;
