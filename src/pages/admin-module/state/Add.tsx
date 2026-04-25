import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Checkbox, Typography, App } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon } from 'lucide-react';
import { stateHooks } from '@/hooks/queries/useMasterOther';

const { Title, Text } = Typography;

const COUNTRY_OPTIONS = [{ value: 'INDIA', label: 'INDIA' }];

export default function StateAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  const { data: stateData, isLoading } = stateHooks.useDetail(id || '');
  const createMutation = stateHooks.useCreate();
  const updateMutation = stateHooks.useUpdate();

  useEffect(() => {
    if (isEdit && stateData?.data) {
      const s = stateData.data;
      form.setFieldsValue({
        name: s.name,
        shortName: s.shortName,
        stateCode: s.stateCode,
        isUT: s.isUT ?? false,
        country: s.country || 'INDIA',
      });
    }
  }, [stateData, form, isEdit]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: values });
        message.success('State updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('State created');
      }
      navigate('/admin-module/master/state/list');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">State</Title>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/admin-module/master/state/list')}
        >
          List
        </Button>
      </div>

      <Text type="danger" className="block text-center font-medium">
        {isEdit ? 'Edit Mode' : 'New Mode'}
      </Text>

      <Card bordered={false} className="!rounded-lg !shadow-sm max-w-2xl mx-auto" loading={isEdit && isLoading}>
        <Form
          form={form}
          layout="horizontal"
          size="small"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          initialValues={{ country: 'INDIA', isUT: false }}
        >
          <Form.Item
            label="State Name"
            name="name"
            rules={[{ required: true, message: 'State Name is required' }]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item label="Short Name" name="shortName">
            <Input maxLength={30} />
          </Form.Item>

          <Form.Item
            label="State Code"
            name="stateCode"
            rules={[{ required: true, message: 'State Code is required' }]}
          >
            <Input maxLength={10} style={{ width: 120 }} />
          </Form.Item>

          <Form.Item label="Is Union Territories" name="isUT" valuePropName="checked">
            <Checkbox />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Country is required' }]}
          >
            <Select options={COUNTRY_OPTIONS} placeholder="Please Select" style={{ width: 240 }} />
          </Form.Item>

          <div className="flex justify-center gap-3 mt-6">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/state/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
