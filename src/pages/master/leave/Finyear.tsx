import React from 'react';
import { Form, DatePicker } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { leaveFinyearHooks } from '@/hooks/queries/useMasterOther';
import dayjs from 'dayjs';

const LeaveFinyearPage: React.FC = () => {
  const { data, isLoading } = leaveFinyearHooks.useList();
  const create = leaveFinyearHooks.useCreate();
  const update = leaveFinyearHooks.useUpdate();
  const del = leaveFinyearHooks.useDelete();

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _from: r.dateFrom ? dayjs(r.dateFrom).format('DD/MM/YYYY') : '',
    _to: r.dateTo ? dayjs(r.dateTo).format('DD/MM/YYYY') : '',
  }));

  return (
    <CombinedMasterPage
      title="Leave Finyear"
      rows={rows}
      isLoading={isLoading}
      columns={[
        { title: 'From', dataIndex: '_from', width: 140 },
        { title: 'To', dataIndex: '_to', width: 140 },
        { title: 'Finyear', dataIndex: 'label', width: 160 },
      ]}
      toFormValues={(r) => ({
        dateFrom: r.dateFrom ? dayjs(r.dateFrom) : undefined,
        dateTo: r.dateTo ? dayjs(r.dateTo) : undefined,
      })}
      renderForm={() => (
        <>
          <Form.Item
            name="dateFrom"
            label="Date From"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Date From is required' }]}
          >
            <DatePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>
          <Form.Item
            name="dateTo"
            label="To"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 14 }}
            rules={[{ required: true, message: 'Date To is required' }]}
          >
            <DatePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>
        </>
      )}
      onSubmit={async (values, editing) => {
        const payload = {
          dateFrom: values.dateFrom ? dayjs(values.dateFrom).toISOString() : undefined,
          dateTo: values.dateTo ? dayjs(values.dateTo).toISOString() : undefined,
        };
        if (editing) await update.mutateAsync({ id: editing._id || editing.id, data: payload });
        else await create.mutateAsync(payload);
      }}
      onDelete={async (id) => { await del.mutateAsync(id); }}
    />
  );
};

export default LeaveFinyearPage;
