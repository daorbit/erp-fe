import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Table, App, Popconfirm } from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import { documentMasterHooks } from '@/hooks/queries/useMasterOther';

const { Title, Text } = Typography;

export default function SiteDocumentMaster() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [colFilter, setColFilter] = useState('');

  const { data, isLoading } = documentMasterHooks.useList();
  const rows: any[] = ((data as any)?.data ?? []) as any[];
  const createMut = documentMasterHooks.useCreate();
  const updateMut = documentMasterHooks.useUpdate();
  const deleteMut = documentMasterHooks.useDelete();

  const filtered = rows.filter((r) =>
    !colFilter || String(r.name || '').toLowerCase().includes(colFilter.toLowerCase()),
  );

  const onSave = async () => {
    try {
      const v = await form.validateFields();
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: v });
        message.success('Document updated');
      } else {
        await createMut.mutateAsync(v);
        message.success('Document created');
      }
      form.resetFields();
      setEditingId(null);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Save failed');
    }
  };

  const onEdit = (r: any) => {
    setEditingId(r._id || r.id);
    form.setFieldsValue({ name: r.name });
  };

  const onClose = () => {
    form.resetFields();
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Site Document Master</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">
          {editingId ? 'Edit Mode' : 'New Mode'}
        </Text>
        <Form form={form} layout="horizontal" size="small">
          <Form.Item
            label={<span>Document Name<span className="text-red-500">*</span></span>}
            name="name"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Document Name is required' }]}
          >
            <Input />
          </Form.Item>
          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={createMut.isPending || updateMut.isPending} onClick={onSave}>Save</Button>
            <Button danger onClick={onClose}>Close</Button>
          </div>
        </Form>
      </Card>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          rowKey={(r) => r._id || r.id}
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          columns={[
            { title: 'SrNo.', key: 'sr', width: 80, render: (_, __, i) => i + 1 },
            {
              title: <div><div>Document Name</div><Input size="small" value={colFilter} onChange={(e) => setColFilter(e.target.value)} /></div>,
              dataIndex: 'name', key: 'name',
              sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
              render: (v: string) => <span className="uppercase">{v}</span>,
            },
            {
              title: 'Edit', key: 'edit', width: 80,
              render: (_, r: any) => (
                <div className="flex items-center gap-1">
                  <Button type="text" size="small" icon={<Edit size={14} />} onClick={() => onEdit(r)} />
                  <Popconfirm title="Delete this document?" onConfirm={() => deleteMut.mutate(r._id || r.id)}>
                    <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
