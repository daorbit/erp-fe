import React, { useState } from 'react';
import { Select, Button, Space, App } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import employeeService from '@/services/employeeService';
import { useBranchList } from '@/hooks/queries/useBranches';

const MultipleBranchTransfer: React.FC = () => {
  const { message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newBranch, setNewBranch] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { data: branches } = useBranchList();
  const branchOpts = (branches?.data ?? []).map((b: any) => ({ value: b._id || b.id, label: b.name }));

  const apply = async () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (!newBranch) { message.error('Pick a target branch'); return; }
    setSubmitting(true);
    try {
      const res: any = await employeeService.bulkUpdate(selectedIds, { branch: newBranch });
      message.success(`Transferred ${res?.data?.modified ?? 0} employee(s)`);
      setSelectedIds([]); setNewBranch(undefined);
    } catch (err: any) { message.error(err?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <EmployeeFilterPanel
      title="Multiple Branch Transfer"
      fields={['company', 'branch', 'department', 'designation', 'status', 'employeeGroup', 'statusAsOnDate']}
      actionLabel="Search"
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="flex items-center gap-4 border-t pt-4">
          <div className="text-sm font-medium">Transfer selected to Branch:</div>
          <Select placeholder="Pick target branch" value={newBranch} onChange={setNewBranch}
            options={branchOpts} style={{ width: 280 }} showSearch optionFilterProp="label" />
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

export default MultipleBranchTransfer;
