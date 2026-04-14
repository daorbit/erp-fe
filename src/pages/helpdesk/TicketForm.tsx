import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateTicket } from '@/hooks/queries/useHelpdesk';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const createMutation = useCreateTicket();

  const handleSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Ticket created');
      navigate('/helpdesk');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/helpdesk')} />
        <Title level={4} className="!mb-0">New Ticket</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
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
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/helpdesk')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TicketForm;
