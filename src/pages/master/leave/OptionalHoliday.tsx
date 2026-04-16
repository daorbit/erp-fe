import React, { useState } from 'react';
import { Card, Form, DatePicker, Input, Select, Button, Space, Typography, Table, App, Popconfirm } from 'antd';
import { Trash2, Edit2 } from 'lucide-react';
import dayjs from 'dayjs';
import { optionalHolidayHooks } from '@/hooks/queries/usePhase2';
import { leaveFinyearHooks } from '@/hooks/queries/useMasterOther';

const { Title } = Typography;

const OptionalHolidayPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: finyears } = leaveFinyearHooks.useList();
  const { data, isLoading, refetch } = optionalHolidayHooks.useList();
  const create = optionalHolidayHooks.useCreate();
  const update = optionalHolidayHooks.useUpdate();
  const del = optionalHolidayHooks.useDelete();

  const handleSubmit = async (values: any) => {
    const payload = {
      date: dayjs(values.date).toISOString(),
      name: values.name,
      finyear: values.finyear,
    };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, data: payload });
      else await create.mutateAsync(payload);
      message.success(editingId ? 'Updated' : 'Saved');
      form.resetFields();
      setEditingId(null);
      refetch();
    } catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  const fyOpts = (finyears?.data ?? []).map((f: any) => ({ value: f._id || f.id, label: f.label }));

  const rows = (data?.data ?? []).map((r: any, i: number) => ({ ...r, _sno: i + 1, _date: r.date ? dayjs(r.date).format('DD/MM/YYYY') : '' }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Optional Holiday</Title>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="horizontal" onFinish={handleSubmit} initialValues={{ date: dayjs() }}>
            <Form.Item name="date" label="Date" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="finyear" label="Financial Year" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="Select" options={fyOpts} />
            </Form.Item>
            <Form.Item name="name" label="Holiday Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <div className="flex justify-center mt-2">
              <Space>
                <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending}>Save</Button>
                <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Clear</Button>
                <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Close</Button>
              </Space>
            </div>
          </Form>
        </Card>
        <Card bordered={false}>
          <Table
            size="small" bordered
            columns={[
              { title: 'SNo', dataIndex: '_sno', width: 70 },
              { title: 'Date', dataIndex: '_date', width: 140 },
              { title: 'Holiday Name', dataIndex: 'name' },
              {
                title: 'Edit', width: 70, align: 'center' as const,
                render: (_: any, r: any) => (
                  <Button type="text" icon={<Edit2 size={14} />} onClick={() => {
                    form.setFieldsValue({ date: dayjs(r.date), name: r.name, finyear: r.finyear?._id || r.finyear });
                    setEditingId(r._id || r.id);
                  }} />
                ),
              },
              {
                title: 'Del', width: 70, align: 'center' as const,
                render: (_: any, r: any) => (
                  <Popconfirm title="Delete?" onConfirm={async () => { try { await del.mutateAsync(r._id || r.id); message.success('Deleted'); } catch (e: any) { message.error(e?.message || 'Failed'); } }}>
                    <Button type="text" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={rows}
            rowKey={(r: any) => r._id || r.id}
            loading={isLoading}
            pagination={{ pageSize: 20 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default OptionalHolidayPage;
