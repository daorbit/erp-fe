import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { qualificationHooks } from '@/hooks/queries/useMasterOther';

const QualificationPage: React.FC = () => {
  const { data, isLoading } = qualificationHooks.useList();
  const create = qualificationHooks.useCreate();
  const update = qualificationHooks.useUpdate();
  const del = qualificationHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Qualification"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[{ title: 'Document Name', dataIndex: 'name' }]}
      renderForm={() => (
        <Form.Item
          name="name"
          label="Qualification"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          rules={[{ required: true, message: 'Qualification is required' }]}
        >
          <Input maxLength={100} autoFocus />
        </Form.Item>
      )}
      onSubmit={async (values, editing) => {
        if (editing) await update.mutateAsync({ id: editing._id || editing.id, data: values });
        else await create.mutateAsync(values);
      }}
      onDelete={async (id) => { await del.mutateAsync(id); }}
      layout="stacked"
    />
  );
};

export default QualificationPage;
