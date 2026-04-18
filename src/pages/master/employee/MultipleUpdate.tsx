import React, { useState } from 'react';
import { Select, Button, Space, App, InputNumber, Input, Form } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import employeeService from '@/services/employeeService';
import { EMP_STATUS_OPTIONS, CATEGORY_SKILL_OPTIONS, SUB_COMPANY_OPTIONS, PF_SCHEME_OPTIONS } from '@/types/enums';

// Multiple Employee Update — pick employees, set any combination of fields,
// apply in bulk. Fields picked are only sent if the corresponding checkbox /
// non-empty value is present.
const MultipleUpdate: React.FC = () => {
  const { message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const setU = (k: string, v: any) => setUpdates((p) => {
    const next = { ...p };
    if (v === undefined || v === null || v === '') delete next[k];
    else next[k] = v;
    return next;
  });

  const apply = async () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (Object.keys(updates).length === 0) { message.error('Enter at least one field to update'); return; }
    setSubmitting(true);
    try {
      const res: any = await employeeService.bulkUpdate(selectedIds, updates);
      message.success(`Updated ${res?.data?.modified ?? 0} employee(s)`);
      setSelectedIds([]); setUpdates({});
    } catch (err: any) { message.error(err?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <EmployeeFilterPanel
      title="Multiple Employee Update"
      fields={['company', 'branch', 'department', 'designation', 'status', 'employeeGroup', 'statusAsOnDate']}
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-3">
            Fields to apply to {selectedIds.length} selected employee(s):
          </div>
          <Form layout="horizontal" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6">
            <Form.Item label="Emp Status" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="(unchanged)" options={EMP_STATUS_OPTIONS}
                value={updates.empStatus} onChange={(v) => setU('empStatus', v)} />
            </Form.Item>
            <Form.Item label="Category Skill" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="(unchanged)" options={CATEGORY_SKILL_OPTIONS}
                value={updates.categorySkill} onChange={(v) => setU('categorySkill', v)} />
            </Form.Item>
            <Form.Item label="Sub Company" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="(unchanged)" options={SUB_COMPANY_OPTIONS}
                value={updates.subCompany} onChange={(v) => setU('subCompany', v)} />
            </Form.Item>
            <Form.Item label="PF Scheme" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="(unchanged)" options={PF_SCHEME_OPTIONS}
                value={updates.pfScheme} onChange={(v) => setU('pfScheme', v)} />
            </Form.Item>
            <Form.Item label="Confirmation Day" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} className="w-full" value={updates.confirmationDay}
                onChange={(v) => setU('confirmationDay', v)} placeholder="(unchanged)" />
            </Form.Item>
            <Form.Item label="Notice Period (days)" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} className="w-full" value={updates.noticePeriodDays}
                onChange={(v) => setU('noticePeriodDays', v)} placeholder="(unchanged)" />
            </Form.Item>
            <Form.Item label="Remark" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={updates.empRemark} onChange={(e) => setU('empRemark', e.target.value)}
                placeholder="(unchanged)" allowClear />
            </Form.Item>
          </Form>
          <Space>
            <Button type="primary" danger onClick={apply} loading={submitting}
              disabled={selectedIds.length === 0 || Object.keys(updates).length === 0}>
              Update {selectedIds.length} Employee(s)
            </Button>
          </Space>
        </div>
      }
    />
  );
};

export default MultipleUpdate;
