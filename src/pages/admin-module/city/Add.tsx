import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Input, Button, Select, Typography, App } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon } from 'lucide-react';
import { cityHooks, stateHooks } from '@/hooks/queries/useMasterOther';

const { Title, Text } = Typography;

function FRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1">{children}</div>;
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

export default function CityAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  const { data: cityData, isLoading } = cityHooks.useDetail(id || '');
  const createMutation = cityHooks.useCreate();
  const updateMutation = cityHooks.useUpdate();

  // Live states from backend (replaces hardcoded list)
  const { data: statesResp, isLoading: statesLoading } = stateHooks.useList({ limit: '500' });
  const stateOptions = useMemo(() => {
    const list = (statesResp?.data ?? []) as Array<{ name: string }>;
    return list.map((s) => ({ value: s.name, label: s.name }));
  }, [statesResp]);

  // All cities — used to derive district options on the FE by filtering by selected state
  const { data: citiesResp } = cityHooks.useList({ limit: '5000' });
  const selectedState = Form.useWatch('state', form);
  const districtOptions = useMemo(() => {
    if (!selectedState) return [];
    const list = (citiesResp?.data ?? []) as Array<{ state?: string; district?: string }>;
    const set = new Set<string>();
    list.forEach((c) => {
      if (c.state === selectedState && c.district) set.add(c.district);
    });
    return Array.from(set).sort().map((d) => ({ value: d, label: d }));
  }, [citiesResp, selectedState]);

  useEffect(() => {
    if (isEdit && cityData?.data) {
      const c = cityData.data;
      form.setFieldsValue({
        state: c.state,
        district: c.district,
        subDistrict: c.subDistrict,
        name: c.name,
        shortName: c.shortName,
        pinCode: c.pinCode,
        stdCode: c.stdCode,
      });
    }
  }, [cityData, form, isEdit]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: values });
        message.success('City updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('City created');
      }
      navigate('/admin-module/master/city/list');
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
        <Title level={4} className="!mb-0">City</Title>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/admin-module/master/city/list')}
        >
          List
        </Button>
      </div>

      <Text type="danger" className="block text-center font-medium">
        {isEdit ? 'Edit Mode' : 'New Mode'}
      </Text>

      <Card bordered={false} className="!rounded-lg !shadow-sm" loading={isEdit && isLoading}>
        <Form form={form} layout="horizontal" size="small">
          <FRow>
            <FItem label="State Name" name="state">
              <Select
                options={stateOptions}
                loading={statesLoading}
                showSearch
                optionFilterProp="label"
                placeholder="Please Select"
                allowClear
                onChange={() => form.setFieldValue('district', undefined)}
              />
            </FItem>
            <FItem label="District" name="district">
              <Select
                options={districtOptions}
                showSearch
                optionFilterProp="label"
                placeholder="Please Select"
                allowClear
                disabled={!selectedState}
                notFoundContent={selectedState ? 'No districts found' : 'Select a state first'}
              />
            </FItem>
          </FRow>
          <FRow>
            <div />
            <FItem label="Sub District (Tehsil)" name="subDistrict">
              <Input placeholder="Please Select" />
            </FItem>
          </FRow>
          <FRow>
            <FItem label="City Name" name="name" required>
              <Input maxLength={100} />
            </FItem>
            <FItem label="Pin Code" name="pinCode">
              <Input maxLength={10} />
            </FItem>
          </FRow>
          <FRow>
            <FItem label="Short Name" name="shortName">
              <Input maxLength={30} />
            </FItem>
            <FItem label="STD Code" name="stdCode">
              <Input maxLength={10} />
            </FItem>
          </FRow>

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/city/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
