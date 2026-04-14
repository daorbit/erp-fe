import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateLeaveType } from '@/hooks/queries/useLeaves';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const LeaveTypeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateLeaveType();

  const handleSubmit = (values: any) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        message.success('Leave type created');
        navigate('/leaves');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/leaves')} />
        <Title level={4} className="!mb-0">{t('add')} {t('leave_type')}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Sick Leave" /></Form.Item>
            <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input placeholder="e.g. SL" /></Form.Item>
            <Form.Item name="defaultDays" label="Default Days Per Year" rules={[{ required: true }]}><InputNumber min={0} className="w-full" /></Form.Item>
            <Space>
              <Button onClick={() => navigate('/leaves')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LeaveTypeForm;
