import React, { useState } from 'react';
import { InputNumber, Button, Space, App, Checkbox } from 'antd';
import EmployeeFilterPanel from '@/components/employee/EmployeeFilterPanel';
import salaryStructureService from '@/services/salaryStructureService';

const MultipleSalaryAppraisal: React.FC = () => {
  const { message, modal } = App.useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [percent, setPercent] = useState<number>(0);
  const [pfApplicable, setPfApplicable] = useState(false);
  const [esicApplicable, setEsicApplicable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const apply = () => {
    if (selectedIds.length === 0) { message.error('Select at least one employee'); return; }
    if (!percent || percent <= 0) { message.error('Enter a positive appraisal %'); return; }
    modal.confirm({
      title: 'Apply salary appraisal?',
      content: `This will multiply basic/gross/net/CTC by ${(1 + percent / 100).toFixed(4)} for ${selectedIds.length} employee(s). Continue?`,
      okText: `Appraise ${percent}%`,
      okButtonProps: { danger: true },
      onOk: async () => {
        setSubmitting(true);
        try {
          const res: any = await salaryStructureService.bulkAppraisal({ employeeIds: selectedIds, percent });
          message.success(`Appraised ${res?.data?.modified ?? 0} employee(s)`);
          setSelectedIds([]); setPercent(0);
        } catch (err: any) { message.error(err?.message || 'Failed'); }
        finally { setSubmitting(false); }
      },
    });
  };

  return (
    <EmployeeFilterPanel
      title="Multiple Salary Appraisal"
      fields={['company', 'branch', 'department', 'designation', 'employeeGroup', 'monthYear']}
      actionLabel="Show"
      selectable={{ selectedIds, onChange: setSelectedIds }}
      extras={
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm font-medium">Appraisal % (for selected)</div>
            <InputNumber min={0} max={100} value={percent} onChange={(v) => setPercent(v ?? 0)}
              addonAfter="%" style={{ width: 180 }} />
            <Checkbox checked={pfApplicable} onChange={(e) => setPfApplicable(e.target.checked)}>PF Applicable</Checkbox>
            <Checkbox checked={esicApplicable} onChange={(e) => setEsicApplicable(e.target.checked)}>ESIC Applicable</Checkbox>
          </div>
          <Space>
            <Button type="primary" danger onClick={apply} loading={submitting} disabled={selectedIds.length === 0}>
              Appraise {selectedIds.length} Employee(s)
            </Button>
          </Space>
        </div>
      }
    />
  );
};

export default MultipleSalaryAppraisal;
