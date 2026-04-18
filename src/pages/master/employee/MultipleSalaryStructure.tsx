import React, { useState } from 'react';
import { Select, Button, Space, App, Checkbox, Radio } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import salaryStructureService from '@/services/salaryStructureService';
import { useSalaryStructureList } from '@/hooks/queries/useSalaryStructures';

const MultipleSalaryStructure: React.FC = () => {
  const { message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [structure, setStructure] = useState<string | undefined>();
  const [pfApplicable, setPfApplicable] = useState(false);
  const [esicApplicable, setEsicApplicable] = useState(false);
  const [structureType, setStructureType] = useState<'all' | 'new' | 'existing'>('all');
  const [submitting, setSubmitting] = useState(false);

  const { data: structures } = useSalaryStructureList();
  const structureOpts = (structures?.data ?? []).map((s: any) => ({ value: s._id || s.id, label: s.name }));

  const apply = async () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (!structure) { message.error('Pick a Salary Structure'); return; }
    setSubmitting(true);
    try {
      const res: any = await salaryStructureService.bulkAssignToEmployees({
        employeeIds: selectedIds, structure, pfApplicable, esicApplicable,
      });
      message.success(`Assigned to ${res?.data?.modified ?? 0} employee(s)`);
      setSelectedIds([]); setStructure(undefined);
    } catch (err: any) { message.error(err?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <EmployeeFilterPanel
      title="Assign Multiple Salary Structure"
      fields={['company', 'branch', 'department', 'designation', 'employeeGroup', 'tagName', 'monthYear']}
      actionLabel="Show"
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm font-medium">Salary-Structure *</div>
            <Select placeholder="Please Select" value={structure} onChange={setStructure}
              options={structureOpts} style={{ width: 300 }} showSearch optionFilterProp="label" />
            <div className="text-sm font-medium">Structure Type</div>
            <Radio.Group value={structureType} onChange={(e) => setStructureType(e.target.value)}>
              <Radio value="all">All</Radio>
              <Radio value="new">New-Employee</Radio>
              <Radio value="existing">Existing-Employee</Radio>
            </Radio.Group>
          </div>
          <div className="flex items-center gap-6">
            <Checkbox checked={pfApplicable} onChange={(e) => setPfApplicable(e.target.checked)}>PF Applicable</Checkbox>
            <Checkbox checked={esicApplicable} onChange={(e) => setEsicApplicable(e.target.checked)}>ESIC Applicable</Checkbox>
          </div>
          <Space>
            <Button type="primary" danger onClick={apply} loading={submitting}
              disabled={selectedIds.length === 0 || !structure}>
              Assign to {selectedIds.length} Employee(s)
            </Button>
            <Button disabled>Export to Excel</Button>
            <Button disabled>Export to Gross Excel</Button>
          </Space>
          <div className="text-xs text-red-600 leading-5">
            <div><b>Import from Excel Condition</b></div>
            <div>1 Pay-Mode uses :- 1 = For Cash, 2 - For Cheque, 3 - For A/C Trn.</div>
            <div>2 In case of excel import only those employee will listed which is matched in search criteria and available in excel.</div>
            <div>3 "Grey" colour column only for view purpose.</div>
          </div>
        </div>
      }
    />
  );
};

export default MultipleSalaryStructure;
