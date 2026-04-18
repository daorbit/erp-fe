import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { tagHooks } from '@/hooks/queries/useMasterOther';

const TagPage: React.FC = () => {
  const { data, isLoading } = tagHooks.useList();
  const create = tagHooks.useCreate();
  const update = tagHooks.useUpdate();
  const del = tagHooks.useDelete();

  return (
    <CombinedMasterPage
      title="Tag"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[
        { title: 'Tag Name', dataIndex: 'name' },
        { title: 'Tag Short Name', dataIndex: 'shortName', width: 200 },
      ]}
      renderForm={() => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Form.Item
            name="name"
            label="Tag Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Tag Name is required' }]}
          >
            <Input maxLength={100} autoFocus />
          </Form.Item>
          <Form.Item name="shortName" label="Short Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={30} />
          </Form.Item>
        </div>
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

export default TagPage;
