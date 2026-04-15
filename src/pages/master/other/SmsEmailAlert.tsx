import React from 'react';
import { Form, Input, Checkbox, Select } from 'antd';
import CombinedMasterPage from '@/components/master/CombinedMasterPage';
import { smsEmailAlertHooks } from '@/hooks/queries/usePhase2';
import { useEmployeeList } from '@/hooks/queries/useEmployees';

const SmsEmailAlertPage: React.FC = () => {
  const { data, isLoading } = smsEmailAlertHooks.useList();
  const create = smsEmailAlertHooks.useCreate();
  const update = smsEmailAlertHooks.useUpdate();
  const del = smsEmailAlertHooks.useDelete();
  const { data: emps } = useEmployeeList();

  const empOptions = (emps?.data ?? []).map((e: any) => ({
    value: e._id || e.id,
    label: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim(),
  }));

  const rows = (data?.data ?? []).map((r: any) => ({
    ...r,
    _empName: r.employee && typeof r.employee === 'object' ? `${r.employee.firstName} ${r.employee.lastName}` : '',
  }));

  return (
    <CombinedMasterPage
      title="SMS EMAIL Alert"
      rows={rows}
      isLoading={isLoading}
      columns={[
        { title: 'Employee Name', dataIndex: '_empName' },
        { title: 'Email ID', dataIndex: 'emailId' },
        { title: 'Mobile No.', dataIndex: 'mobileNo', width: 140 },
      ]}
      toFormValues={(r) => ({
        employee: typeof r.employee === 'object' ? r.employee?._id || r.employee?.id : r.employee,
        emailId: r.emailId, mobileNo: r.mobileNo,
        smsOnSalaryAlert: !!r.smsOnSalaryAlert,
        smsEmailOnNewJoiningExitAlert: !!r.smsEmailOnNewJoiningExitAlert,
      })}
      renderForm={() => (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
          <Form.Item name="employee" label="Employee Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Type here atleast 1 character" showSearch optionFilterProp="label" options={empOptions} />
          </Form.Item>
          <Form.Item name="emailId" label="Email ID" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="mobileNo" label="Mobile No." labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            <Input />
          </Form.Item>
          <Form.Item name="smsOnSalaryAlert" valuePropName="checked" label="SMS on Salary Alert" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
            <Checkbox />
          </Form.Item>
          <Form.Item name="smsEmailOnNewJoiningExitAlert" valuePropName="checked" label="SMS/EMAIL On New Joining / Exited Alert" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
            <Checkbox />
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

export default SmsEmailAlertPage;
