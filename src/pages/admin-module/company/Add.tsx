import React, { useState } from 'react';
import {
  Card, Form, Input, Button, Typography, App, Select,
} from 'antd';
import { List as ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cityHooks } from '@/hooks/queries/useMasterOther';
import companyService from '@/services/companyService';

const { Title, Text } = Typography;
const { TextArea } = Input;

function FRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{children}</div>;
}

function FItem({
  label, name, children, required,
}: { label: string; name: string; children?: React.ReactNode; required?: boolean }) {
  return (
    <Form.Item
      label={label}
      name={name}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 15 }}
      rules={required ? [{ required: true, message: `${label} is required` }] : undefined}
    >
      {children || <Input />}
    </Form.Item>
  );
}

export default function CompanyAdd() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { data: citiesData } = cityHooks.useList();
  const cityOptions = (citiesData?.data ?? []).map((c: any) => ({ value: c.name, label: c.name }));

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: any = {
        ...values,
        address: {
          street: values.address01,
          city: values.city,
          state: values.state,
          zipCode: values.pinCode,
          country: 'India',
        },
      };

      // Remove flattened address fields
      delete payload.address01;
      delete payload.city;
      delete payload.state;
      delete payload.pinCode;

      await companyService.create(payload);
      message.success('Company created successfully');
      navigate('/admin-module/master/company/list');
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.message || 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="!mb-0.5">Add Company</Title>
          <Text type="secondary" className="text-sm">Create a new company in your group</Text>
        </div>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/admin-module/master/company/list')}
        >
          List
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Form form={form} layout="horizontal" size="small">
          {/* ─── Basic Info ─────────────────────────────────────────────────── */}
          <FRow>
            <FItem label="Company Name" name="name" required><Input /></FItem>
            <FItem label="Short Name (Code)" name="code" required><Input /></FItem>
          </FRow>
          <FRow>
            <FItem label="Email" name="email" required>
              <Input type="email" />
            </FItem>
            <FItem label="Phone No." name="phone"><Input /></FItem>
          </FRow>
          <FRow>
            <FItem label="Contact Person" name="contactPerson"><Input /></FItem>
            <FItem label="Website" name="website"><Input /></FItem>
          </FRow>

          {/* ─── Address ────────────────────────────────────────────────────── */}
          <FRow>
            <FItem label="Address" name="address01"><TextArea rows={2} /></FItem>
            <FItem label="City" name="city">
              <Select
                options={cityOptions}
                showSearch
                optionFilterProp="label"
                allowClear
                placeholder="Select city"
              />
            </FItem>
          </FRow>
          <FRow>
            <FItem label="State" name="state"><Input /></FItem>
            <FItem label="Pin Code" name="pinCode"><Input /></FItem>
          </FRow>

          {/* ─── Tax ────────────────────────────────────────────────────────── */}
          <FRow>
            <FItem label="GST Number" name="gstNumber"><Input /></FItem>
            <FItem label="PAN Number" name="panNumber"><Input /></FItem>
          </FRow>

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/company/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
