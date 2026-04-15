import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { otherIncomeHooks } from '@/hooks/queries/useMasterOther';

const OtherIncomePage: React.FC = () => {
  const { data, isLoading } = otherIncomeHooks.useList();
  const create = otherIncomeHooks.useCreate();
  const update = otherIncomeHooks.useUpdate();
  const del = otherIncomeHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Other Income Master"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[
        { title: 'Income Name', dataIndex: 'name' },
        { title: 'Income Type', dataIndex: 'incomeType' },
      ]}
      renderForm={() => (
        <>
          <Form.Item
            name="name"
            label="Other Income"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Other Income is required' }]}
          >
            <Input maxLength={150} autoFocus />
          </Form.Item>
          <Form.Item
            name="incomeType"
            label="Income Type"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Income Type is required' }]}
          >
            <Input maxLength={100} />
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

export default OtherIncomePage;
