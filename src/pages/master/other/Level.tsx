import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { levelHooks } from '@/hooks/queries/useMasterOther';

const LevelPage: React.FC = () => {
  const { data, isLoading } = levelHooks.useList();
  const create = levelHooks.useCreate();
  const update = levelHooks.useUpdate();
  const del = levelHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Level"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[
        { title: 'Level Name', dataIndex: 'name' },
        { title: 'Level Short Name', dataIndex: 'shortName', width: 200 },
      ]}
      renderForm={() => (
        <>
          <Form.Item
            name="name"
            label="Level Name"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 12 }}
            rules={[{ required: true, message: 'Level Name is required' }]}
          >
            <Input maxLength={100} autoFocus />
          </Form.Item>
          <Form.Item
            name="shortName"
            label="Level Short Name"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 12 }}
            rules={[{ required: true, message: 'Level Short Name is required' }]}
          >
            <Input maxLength={30} style={{ width: 200 }} />
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

export default LevelPage;
