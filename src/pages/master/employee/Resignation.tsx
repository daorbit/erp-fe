import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, DatePicker, Select, InputNumber, Button, Space, Typography, App, Table, Tag, Popconfirm,
} from 'antd';
import { List as ListIcon, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { resignationHooks } from '@/hooks/queries/usePhase2';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { RESIGN_MODE_OPTIONS, ResignMode } from '@/types/enums';

const { Title } = Typography;

const ResignationPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [showList, setShowList] = useState(false);

  const { data: empList } = useEmployeeList();
  const { data, refetch } = resignationHooks.useList();
  const create = resignationHooks.useCreate();
  const del = resignationHooks.useDelete();

  const employeeOptions = (empList?.data ?? []).map((e: any) => ({
    value: e._id || e.id,
    label: `${e.userId?.firstName ?? e.firstName ?? ''} ${e.userId?.lastName ?? e.lastName ?? ''} (${e.employeeId ?? ''})`,
  }));

  const handleSubmit = async (values: any) => {
    try {
      await create.mutateAsync({
        ...values,
        resignationDate: dayjs(values.resignationDate).toISOString(),
        noticePeriodFrom: values.noticePeriodFrom ? dayjs(values.noticePeriodFrom).toISOString() : undefined,
        noticePeriodTo: values.noticePeriodTo ? dayjs(values.noticePeriodTo).toISOString() : undefined,
      });
      message.success('Resignation saved');
      form.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Resignation Master</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => setShowList((s) => !s)}>List</Button>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{ resignationDate: dayjs(), noticePeriodFrom: dayjs(), noticeDay: 0, resignMode: ResignMode.RESIGN }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item name="resignationDate" label="Resignation Date" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="noticeDay" label="Notice Day" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="noticePeriodFrom" label="Notice Period From" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="noticePeriodTo" label="Notice Period To" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="employee" label="Employee Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Select placeholder="Type here atleast 1 character to search" showSearch optionFilterProp="label" options={employeeOptions} />
            </Form.Item>
            <Form.Item name="remark" label="Remark" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input />
            </Form.Item>
            <Form.Item name="resignMode" label="Resign Mode" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Select options={RESIGN_MODE_OPTIONS} />
            </Form.Item>
            <Form.Item name="attachmentUrl" label="Attachment" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input placeholder="File URL" />
            </Form.Item>
          </div>
          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={create.isPending}>Save</Button>
              <Button onClick={() => form.resetFields()}>Clear</Button>
              <Button onClick={() => navigate('/master/employee/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      {showList && (
        <Card bordered={false}>
          <Table
            columns={[
              { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 60 },
              { title: 'Employee', render: (_: any, r: any) => r.employee && typeof r.employee === 'object' ? `${r.employee.userId?.firstName ?? r.employee.firstName ?? ''} ${r.employee.userId?.lastName ?? r.employee.lastName ?? ''}`.trim() : '' },
              { title: 'Resign Date', dataIndex: 'resignationDate', render: (v: string) => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
              { title: 'Mode', dataIndex: 'resignMode', render: (v: ResignMode) => <Tag color="red">{v?.toUpperCase()}</Tag> },
              { title: 'Notice Day', dataIndex: 'noticeDay', width: 100 },
              { title: 'Status', dataIndex: 'status', width: 120 },
              {
                title: 'Del', width: 70, align: 'center' as const,
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

export default ResignationPage;
