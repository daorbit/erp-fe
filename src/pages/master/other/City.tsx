import React from 'react';
import { Form, Input } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { cityHooks } from '@/hooks/queries/useMasterOther';

const CityPage: React.FC = () => {
  const { data, isLoading } = cityHooks.useList();
  const create = cityHooks.useCreate();
  const update = cityHooks.useUpdate();
  const del = cityHooks.useDelete();

  return (
    <CombinedMasterPage
      title="City"
      rows={data?.data ?? []}
      isLoading={isLoading}
      columns={[
        { title: 'City Name', dataIndex: 'name' },
        { title: 'State Name', dataIndex: 'state' },
        { title: 'Pin Code', dataIndex: 'pinCode', width: 120 },
      ]}
      renderForm={() => (
        <>
          <Form.Item
            name="name"
            label="City Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'City Name is required' }]}
          >
            <Input maxLength={100} autoFocus />
          </Form.Item>
          <Form.Item
            name="state"
            label="State Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'State Name is required' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="shortName" label="Short Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item name="stdCode" label="STD Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={10} />
          </Form.Item>
          <Form.Item name="pinCode" label="Pin Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input maxLength={10} />
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

export default CityPage;
