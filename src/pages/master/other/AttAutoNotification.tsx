import React from 'react';
import { Card, Form, Select, Button, Space, Typography, Table, App, Popconfirm } from 'antd';
import { Trash2 } from 'lucide-react';
import { attAutoNotificationHooks } from '@/hooks/queries/useMasterOther';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useMyCompany } from '@/hooks/queries/useCompanies';

const { Title } = Typography;

const AttAutoNotificationPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data, isLoading } = attAutoNotificationHooks.useList();
  const { data: branches } = useBranchList();
  const { data: myCompanyData } = useMyCompany();
  const companyOptions = myCompanyData?.data
    ? [{ value: myCompanyData.data._id || myCompanyData.data.id, label: myCompanyData.data.name }]
    : [];
  const create = attAutoNotificationHooks.useCreate();
  const del = attAutoNotificationHooks.useDelete();

  const handleSubmit = async (values: any) => {
    try {
      await create.mutateAsync({ branch: values.branch });
      message.success('Added');
      form.resetFields(['branch']);
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  const rows = data?.data ?? [];
  const branchOptions = (branches?.data ?? []).map((b: any) => ({ value: b._id || b.id, label: b.name }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">Attendance Auto Mail / SMS Setting</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Form.Item
            label="Company Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true }]}
          >
            <Select placeholder="Please Select" options={companyOptions} />
          </Form.Item>
          <Form.Item
            name="branch"
            label="Branch Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Branch is required' }]}
          >
            <Select placeholder="Please Select" options={branchOptions} showSearch optionFilterProp="label" />
          </Form.Item>
          <div className="col-span-full flex justify-center">
            <Space>
              <Button type="primary" htmlType="submit" loading={create.isPending}>Save</Button>
              <Button onClick={() => form.resetFields()}>Clear</Button>
            </Space>
          </div>
        </Form>
      </Card>
      <Card bordered={false}>
        <Table
          columns={[
            { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
            { title: 'Company Name', dataIndex: ['company', 'name'] as any, key: 'company' },
            { title: 'Branch Name', dataIndex: ['branch', 'name'] as any, key: 'branch' },
            {
              title: 'Delete', width: 80, align: 'center' as const,
              render: (_: any, r: any) => (
                <Popconfirm title="Remove?" okText="Remove" okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try { await del.mutateAsync(r._id || r.id); message.success('Removed'); }
                    catch (e: any) { message.error(e?.message || 'Failed'); }
                  }}>
                  <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
              ),
            },
          ]}
          dataSource={rows}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small"
          bordered
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default AttAutoNotificationPage;
