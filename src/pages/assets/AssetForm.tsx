import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateAsset } from '@/hooks/queries/useAssets';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const AssetForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const createMutation = useCreateAsset();

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        name: values.name,
        assetTag: values.assetTag,
        category: values.category,
        brand: values.brand,
        condition: values.condition,
        serialNumber: values.serialNumber,
        purchaseDate: values.purchaseDate ? new Date(values.purchaseDate).toISOString() : undefined,
        notes: values.description,
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await createMutation.mutateAsync(payload);
      message.success('Asset created');
      navigate('/assets');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create asset');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/assets')} />
        <Title level={4} className="!mb-0">{t('add_asset')}</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
          <Form.Item name="name" label="Asset Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. MacBook Pro 14" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Category" options={['laptop', 'desktop', 'monitor', 'phone', 'furniture', 'other'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="brand" label="Brand">
              <Input placeholder="Brand name" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="assetTag" label="Asset Tag" rules={[{ required: true, pattern: /^AST-\d{4}-\d{3,}$/, message: 'Format: AST-YYYY-NNN' }]}>
              <Input placeholder="e.g. AST-2026-001" />
            </Form.Item>
            <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
              <Select placeholder="Condition" options={['new', 'good', 'fair', 'poor'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
          </div>
          <Form.Item name="serialNumber" label="Serial Number">
            <Input placeholder="Serial number" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="Purchase Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="Notes">
            <Input.TextArea rows={2} placeholder="Additional notes" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/assets')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AssetForm;
