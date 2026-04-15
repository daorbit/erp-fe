import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { bankHooks } from '@/hooks/queries/useMasterOther';

// Page title on the NwayERP screenshot is "Bank Master".
const BankPage: React.FC = () => {
  const { data, isLoading } = bankHooks.useList();
  const create = bankHooks.useCreate();
  const update = bankHooks.useUpdate();
  const del = bankHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Bank Master"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[
        { title: 'Bank Name', dataIndex: 'name' },
        { title: 'Account Number', dataIndex: 'currentAccountNo', width: 200 },
        { title: 'Bank Address', dataIndex: 'address' },
        { title: 'IFSC Code No.', dataIndex: 'ifscCode', width: 160 },
      ]}
      renderForm={() => (
        <>
          <Form.Item
            name="name"
            label="Bank Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Bank Name is required' }]}
          >
            <Input maxLength={150} autoFocus />
          </Form.Item>
          <Form.Item
            name="currentAccountNo"
            label="Current A/C"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Current A/C is required' }]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="address" label="Bank Address" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={300} />
          </Form.Item>
          <Form.Item name="ifscCode" label="IFSC Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={20} />
          </Form.Item>
        </>
      )}
      onSubmit={async (values, editing) => {
        if (editing) await update.mutateAsync({ id: editing._id || editing.id, data: values });
        else await create.mutateAsync(values);
      }}
      onDelete={async (id) => { await del.mutateAsync(id); }}
    />
  );
};

export default BankPage;
