import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateHoliday } from '@/hooks/queries/useHolidays';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const HolidayForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateHoliday();

  const handleSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Holiday added');
      navigate('/holidays');
    } catch (err: any) {
      message.error(err?.message || 'Failed to add holiday');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/holidays')} />
        <Title level={4} className="!mb-0">{t('add_holiday')}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Holiday Name" rules={[{ required: true }]}>
              <Input placeholder="Enter holiday name" />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" options={[
                  { value: 'public', label: 'Public' },
                  { value: 'religious', label: 'Religious' },
                  { value: 'company_specific', label: 'Company Specific' },
                  { value: 'optional', label: 'Optional' },
                ]} />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Brief description" />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate('/holidays')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('add')}</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default HolidayForm;
