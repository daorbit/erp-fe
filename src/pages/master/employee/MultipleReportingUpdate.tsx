import React, { useState } from 'react';
import { Select, Button, Space, App } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import employeeService from '@/services/employeeService';
import { useEmployeeList } from '@/hooks/queries/useEmployees';

const MultipleReportingUpdate: React.FC = () => {
  const { message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reportingEmp, setReportingEmp] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const { data: emps } = useEmployeeList();

  const empOpts = (emps?.data ?? []).map((e: any) => ({
    value: e._id || e.id,
    label: `${e.firstName ?? ''} ${e.lastName ?? ''} (${e.employeeId ?? ''})`,
  }));

  const apply = async () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (!reportingEmp) { message.error('Pick a reporting employee'); return; }
    setSubmitting(true);
    try {
      const res: any = await employeeService.bulkUpdate(selectedIds, { reportingEmp });
      message.success(`Updated reporting manager for ${res?.data?.modified ?? 0} employee(s)`);
      setSelectedIds([]); setReportingEmp(undefined);
    } catch (err: any) { message.error(err?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <EmployeeFilterPanel
      title="Multiple Reporting Employee Update"
      fields={['company', 'branch', 'department', 'designation', 'employeeGroup']}
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="text-sm font-medium">Set Reporting Employee:</div>
          <Select placeholder="Type atleast 1 character to search" showSearch optionFilterProp="label"
            value={reportingEmp} onChange={setReportingEmp}
            options={empOpts} style={{ width: 340 }} />
          <Space>
            <Button type="primary" danger onClick={apply} loading={submitting} disabled={selectedIds.length === 0}>
              Update {selectedIds.length} Employee(s)
            </Button>
          </Space>
        </div>
      }
    />
  );
};

export default MultipleReportingUpdate;
