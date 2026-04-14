import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateExpense } from '@/hooks/queries/useExpenses';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const createMutation = useCreateExpense();

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        date: values.date ? new Date(values.date).toISOString() : undefined,
      };
      await createMutation.mutateAsync(payload);
      message.success('Expense claim created');
      navigate('/expenses');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/expenses')} />
        <Title level={4} className="!mb-0">{t('new_expense')}</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
          <Form.Item name="title" label="Expense Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Travel to client site" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Category" options={[
                { value: 'travel', label: 'Travel' },
                { value: 'meals', label: 'Meals' },
                { value: 'accommodation', label: 'Accommodation' },
                { value: 'transportation', label: 'Transportation' },
                { value: 'office_supplies', label: 'Office Supplies' },
                { value: 'training', label: 'Training' },
                { value: 'medical', label: 'Medical' },
                { value: 'other', label: 'Other' },
              ]} />
            </Form.Item>
            <Form.Item name="amount" label="Amount (INR)" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} placeholder="0" prefix="₹" />
            </Form.Item>
          </div>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Expense details..." />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/expenses')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ExpenseForm;
