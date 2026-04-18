import React from 'react';
import { Form, Input, Select } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { gradeHooks, levelHooks } from '@/hooks/queries/useMasterOther';

const GradePage: React.FC = () => {
  const { data, isLoading } = gradeHooks.useList();
  const { data: levelData } = levelHooks.useList();
  const create = gradeHooks.useCreate();
  const update = gradeHooks.useUpdate();
  const del = gradeHooks.useDelete();

  const levels = levelData?.data ?? [];
  const levelOptions = levels.map((l: any) => ({ value: l._id || l.id, label: l.name }));

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _levelName: r.level?.name ?? '',
  }));

  return (
    <CombinedMasterPage
      title="Grade"
      rows={rows}
      isLoading={isLoading}
      columns={[
        { title: 'Grade Name', dataIndex: 'name' },
        { title: 'Level Name', dataIndex: '_levelName', width: 200 },
      ]}
      toFormValues={(r) => ({
        name: r.name,
        level: typeof r.level === 'object' ? r.level?._id || r.level?.id : r.level,
      })}
      renderForm={() => (
        <>
          <Form.Item
            name="name"
            label="Grade Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Grade Name is required' }]}
          >
            <Input maxLength={100} autoFocus />
          </Form.Item>
          <Form.Item
            name="level"
            label="Level Name"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Level is required' }]}
          >
            <Select placeholder="Please Select" options={levelOptions} showSearch optionFilterProp="label" />
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

export default GradePage;
