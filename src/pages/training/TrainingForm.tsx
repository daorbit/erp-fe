import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateTraining } from '@/hooks/queries/useTraining';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const TrainingForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const createMutation = useCreateTraining();

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await createMutation.mutateAsync(payload);
      message.success('Training program created');
      navigate('/training');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create training program');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/training')} />
        <Title level={4} className="!mb-0">Create Training Program</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
          <Form.Item name="title" label="Program Title" rules={[{ required: true }]}>
            <Input placeholder="Enter program title" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category" options={[
              { value: 'technical', label: 'Technical' },
              { value: 'soft_skills', label: 'Soft Skills' },
              { value: 'compliance', label: 'Compliance' },
              { value: 'leadership', label: 'Leadership' },
              { value: 'safety', label: 'Safety' },
              { value: 'other', label: 'Other' },
            ]} />
          </Form.Item>
          <Form.Item name="trainer" label="Trainer">
            <Input placeholder="Trainer name" />
          </Form.Item>
          <Form.Item name="duration" label="Duration">
            <Input placeholder="e.g. 2 weeks, 3 days" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="startDate" label="Start Date"><Input type="date" /></Form.Item>
            <Form.Item name="endDate" label="End Date"><Input type="date" /></Form.Item>
          </div>
          <Form.Item name="maxParticipants" label="Max Participants">
            <InputNumber className="w-full" min={1} placeholder="Max participants" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Program description" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/training')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TrainingForm;
