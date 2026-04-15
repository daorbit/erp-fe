import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, DatePicker, Checkbox, Button, Space, Typography, App, Table, Popconfirm,
} from 'antd';
import { List as ListIcon, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { manageMessageHooks } from '@/hooks/queries/usePhase2';
import { useEmployeeList } from '@/hooks/queries/useEmployees';

const { Title } = Typography;
const { TextArea } = Input;

const ManageMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [showList, setShowList] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data: emps } = useEmployeeList();
  const { data, refetch } = manageMessageHooks.useList();
  const create = manageMessageHooks.useCreate();
  const del = manageMessageHooks.useDelete();

  const employees = emps?.data ?? [];
  const allIds = employees.map((e: any) => e._id || e.id);

  const handleCheckAll = () => setSelected([...allIds]);
  const handleUncheckAll = () => setSelected([]);

  const handleSubmit = async (values: any) => {
    try {
      await create.mutateAsync({
        title: values.title,
        description: values.description,
        date: values.date ? dayjs(values.date).toISOString() : new Date().toISOString(),
        isActive: !!values.isActive,
        attachmentUrl: values.attachmentUrl,
        recipients: selected,
      });
      message.success('Message saved');
      form.resetFields();
      setSelected([]);
      refetch();
    } catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Message From Management</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => setShowList((s) => !s)}>List</Button>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit} initialValues={{ date: dayjs(), isActive: true }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item name="title" label="Title" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item name="date" label="Date" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="isActive" valuePropName="checked" label="Is Active" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Checkbox />
            </Form.Item>
            <Form.Item name="attachmentUrl" label="Attachment File" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input placeholder="URL" />
            </Form.Item>
          </div>

          <div className="mb-2"><Space>
            <Button type="primary" danger onClick={handleCheckAll}>CheckAll</Button>
            <Button onClick={handleUncheckAll}>UncheckAll</Button>
          </Space></div>

          <div className="border rounded p-3 mb-4" style={{ maxHeight: 280, overflowY: 'auto' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {employees.map((e: any) => {
                const id = e._id || e.id;
                const isChecked = selected.includes(id);
                return (
                  <Checkbox key={id} checked={isChecked}
                    onChange={(ev) => setSelected((prev) => ev.target.checked ? [...prev, id] : prev.filter((x) => x !== id))}>
                    {e.username || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim()}
                    {e.employeeId ? ` (${e.employeeId})` : ''}
                  </Checkbox>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={create.isPending}>Save</Button>
              <Button onClick={() => navigate('/master/other/manage-messages')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      {showList && (
        <Card bordered={false}>
          <Table
            columns={[
              { title: 'SNo.', render: (_, __, i) => i + 1, width: 60 },
              { title: 'Title', dataIndex: 'title' },
              { title: 'Date', dataIndex: 'date', width: 140, render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
              { title: 'Recipients', render: (_: any, r: any) => r.recipients?.length ?? 0 },
              { title: 'Is Active', dataIndex: 'isActive', width: 100, render: (v: boolean) => v ? 'YES' : 'NO' },
              {
                title: 'Del', width: 70,
                render: (_: any, r: any) => (
                  <Popconfirm title="Delete?" onConfirm={async () => { try { await del.mutateAsync(r._id || r.id); message.success('Deleted'); } catch (e: any) { message.error(e?.message || 'Failed'); } }}>
                    <Button type="text" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                ),
              },
            ]}
            dataSource={data?.data ?? []}
            rowKey={(r: any) => r._id || r.id}
            size="small" bordered pagination={{ pageSize: 20 }}
          />
        </Card>
      )}
    </div>
  );
};

export default ManageMessagesPage;
