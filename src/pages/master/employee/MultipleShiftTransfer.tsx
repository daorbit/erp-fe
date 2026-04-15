import React, { useState } from 'react';
import { Select, Button, Space, App } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import employeeService from '@/services/employeeService';
import { useShiftList } from '@/hooks/queries/useShifts';

const MultipleShiftTransfer: React.FC = () => {
  const { message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newShift, setNewShift] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { data: shifts } = useShiftList();
  const shiftOpts = (shifts?.data ?? []).map((s: any) => ({ value: s._id || s.id, label: s.name }));

  const apply = async () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (!newShift) { message.error('Pick a target shift'); return; }
    setSubmitting(true);
    try {
      const res: any = await employeeService.bulkUpdate(selectedIds, { shift: newShift });
      message.success(`Transferred ${res?.data?.modified ?? 0} employee(s) to the new shift`);
      setSelectedIds([]); setNewShift(undefined);
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <EmployeeFilterPanel
      title="Multiple Shift Transfer"
      fields={['company', 'branch', 'department', 'designation', 'status', 'employeeGroup']}
      actionLabel="Search"
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="text-sm font-medium">Transfer selected to Shift:</div>
          <Select placeholder="Pick target shift" value={newShift} onChange={setNewShift}
            options={shiftOpts} style={{ width: 260 }} showSearch optionFilterProp="label" />
          <Space>
            <Button type="primary" danger onClick={apply} loading={submitting} disabled={selectedIds.length === 0}>
              Transfer {selectedIds.length} Employee(s)
            </Button>
          </Space>
        </div>
      }
    />
  );
};

export default MultipleShiftTransfer;
