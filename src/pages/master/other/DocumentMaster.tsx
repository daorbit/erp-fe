import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { documentMasterHooks } from '@/hooks/queries/useMasterOther';

const DocumentMasterPage: React.FC = () => {
  const { data, isLoading } = documentMasterHooks.useList();
  const create = documentMasterHooks.useCreate();
  const update = documentMasterHooks.useUpdate();
  const del = documentMasterHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Document"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[{ title: 'Document Name', dataIndex: 'name' }]}
      renderForm={() => (
        <Form.Item
          name="name"
          label="Document Name"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          rules={[{ required: true, message: 'Document Name is required' }]}
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

export default DocumentMasterPage;
