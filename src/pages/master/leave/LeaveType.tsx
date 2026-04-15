import React from 'react';
import { Form, Input, InputNumber, Select, Space } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { useLeaveTypeList, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from '@/hooks/queries/useLeaves';

// Uses the combined pattern. "Leave Type (Monthly)" controls carry-forward
// behaviour; "Max Carry Fwrd Limit" enforces the cap.
const LeaveTypePage: React.FC = () => {
  const { data, isLoading } = useLeaveTypeList();
  const create = useCreateLeaveType();
  const update = useUpdateLeaveType();
  const del = useDeleteLeaveType();

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _type: r.carryForward ? 'Carry Forwarded' : 'Not Carry Forwarded',
  }));

  return (
    <CombinedMasterPage
      title="Leave"
      rows={rows}
      isLoading={isLoading}
      columns={[
        { title: 'Leave Name', dataIndex: 'name' },
        { title: 'Short', dataIndex: 'shortName', width: 100 },
        { title: 'Leave Type', dataIndex: '_type', width: 180 },
        { title: 'Max Carry Fwrd', dataIndex: 'maxCarryForward', width: 130 },
        { title: 'Leave Priority', dataIndex: 'leavePriority', width: 130 },
        { title: 'Relaxation Day', dataIndex: 'relaxationDay', width: 130 },
        { title: 'Leave Allow Max', dataIndex: 'leaveAllowMax', width: 140 },
        { title: 'Remarks', dataIndex: 'remarks' },
      ]}
      initialValues={{ carryForward: false, maxCarryForward: 0, leavePriority: 0, relaxationDay: 0, leaveAllowMax: 0, defaultDays: 0 }}
      toFormValues={(r) => ({
        name: r.name, shortName: r.shortName, code: r.code ?? r.shortName,
        carryForward: r.carryForward,
        maxCarryForward: r.maxCarryForward,
        leavePriority: r.leavePriority,
        relaxationDay: r.relaxationDay,
        leaveAllowMax: r.leaveAllowMax,
        remarks: r.remarks,
        defaultDays: r.defaultDays ?? 0,
      })}
      renderForm={() => (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          <Form.Item name="name" label="Leave Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Leave Type" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Space.Compact className="w-full">
              <Form.Item name="carryForward" noStyle>
                <Select options={[{ value: true, label: 'Carry Forwarded' }, { value: false, label: 'Not Carry Forwarded' }]} />
              </Form.Item>
              <Form.Item name="maxCarryForward" label="" noStyle>
                <InputNumber min={0} placeholder="Max Carry Fwrd" />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="Short Name / Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Space.Compact>
              <Form.Item name="shortName" noStyle rules={[{ required: true }]}><Input placeholder="e.g. EL" /></Form.Item>
              <Form.Item name="code" noStyle><Input placeholder="Code" /></Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="remarks" label="Remarks" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Input /></Form.Item>
          <Form.Item name="leavePriority" label="Leave Priority" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="relaxationDay" label="Relaxation Day" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="leaveAllowMax" label="Leave Allow Max" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="defaultDays" label="Default Days" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>
      )}
      onSubmit={async (values, editing) => {
        const payload = { ...values, code: values.code || values.shortName };
        if (editing) await update.mutateAsync({ id: editing._id || editing.id, data: payload });
        else await create.mutateAsync(payload);
      }}
      onDelete={async (id) => { await del.mutateAsync(id); }}
      layout="stacked"
    />
  );
};

export default LeaveTypePage;
