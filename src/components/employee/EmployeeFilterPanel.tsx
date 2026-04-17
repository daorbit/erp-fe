import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Input, Select, Radio, DatePicker, Button, Space, Typography, Table, Checkbox } from 'antd';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useEmployeeGroupList } from '@/hooks/queries/useEmployeeGroups';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { levelHooks, gradeHooks, tagHooks } from '@/hooks/queries/useMasterOther';
import dayjs from 'dayjs';

const { Title } = Typography;

// Full union of every filter an NwayERP Employee-scoped page has shown. Pages
// opt into only the subset they need via the `fields` prop.
export type FilterField =
  | 'company' | 'branch' | 'department' | 'designation'
  | 'level' | 'grade' | 'tagName' | 'employeeGroup'
  | 'employeeName' | 'employeeCode' | 'workId' | 'aadhaar' | 'remark'
  | 'status' | 'statusAsOnDate' | 'monthYear'
  | 'reportingEmp' | 'dojDate' | 'documentUpload' | 'vaccineStatus'
  | 'employeeSignature' | 'employeePhoto';

export interface EmployeeFilterValue {
  company?: string; branch?: string;
  department?: string; designation?: string;
  level?: string; grade?: string; tagName?: string; employeeGroup?: string;
  employeeName?: string; employeeCode?: string; workId?: string;
  aadhaar?: string; remark?: string;
  status?: 'active' | 'in_active' | 'all';
  statusAsOnDate?: dayjs.Dayjs | null;
  month?: string; year?: string;
  reportingEmp?: string;
  dojDate?: dayjs.Dayjs | null;
  documentUpload?: 'have' | 'not_attach' | 'both';
  vaccineStatus?: 'partially' | 'fully' | 'not_vaccinated' | 'all';
}

interface Props {
  title: string;
  /** Which filter fields to render. */
  fields: FilterField[];
  /** Label for the action button ("Show" or "Search"). */
  actionLabel?: string;
  /** Called when user hits the action button with the current filter values
   *  plus the employees that currently match those filters. */
  onAction?: (values: EmployeeFilterValue, employees: any[]) => void;
  /** Extra content rendered below the filter row (used for option checkboxes
   *  like "PF Applicable" / "Import From Excel"). */
  extras?: React.ReactNode;
  /** Render additional buttons next to Show/Close. */
  extraButtons?: React.ReactNode;
  /** Initial filter values. */
  defaults?: EmployeeFilterValue;
  /** Whether to render the result table below filters. Default: true */
  showResultsTable?: boolean;
  /** Additional table columns rendered before Edit/Del. */
  extraColumns?: any[];
  /** Row selection — when set, a checkbox column is shown. Used by the bulk-update
   *  flows to let the user pick target employees. */
  selectable?: {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
  };
}

// Single shared filter row matching the NwayERP screenshots for all the
// Employee-scoped pages. Each individual page selects the subset of fields it
// wants via the `fields` prop and handles the "Show" click via `onAction`.
const EmployeeFilterPanel: React.FC<Props> = ({
  title, fields, actionLabel = 'Show', onAction, extras, extraButtons,
  defaults = {}, showResultsTable = true, extraColumns = [], selectable,
}) => {
  const [filters, setFilters] = useState<EmployeeFilterValue>({
    status: 'active', documentUpload: 'both', vaccineStatus: 'all',
    statusAsOnDate: dayjs(), dojDate: dayjs(),
    ...defaults,
  });
  const setF = <K extends keyof EmployeeFilterValue>(k: K, v: EmployeeFilterValue[K]) =>
    setFilters((p) => ({ ...p, [k]: v }));

  const includes = (f: FilterField) => fields.includes(f);

  // Master data
  const { data: myCompanyData } = useMyCompany();
  const companyOptions = myCompanyData?.data
    ? [{ value: myCompanyData.data._id || myCompanyData.data.id, label: myCompanyData.data.name }]
    : [];

  // Auto-select the user's company
  useEffect(() => {
    if (myCompanyData?.data && !filters.company) {
      setF('company', myCompanyData.data._id || myCompanyData.data.id);
    }
  }, [myCompanyData]);

  const { data: branches } = useBranchList();
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: groups } = useEmployeeGroupList();
  const { data: emps } = useEmployeeList();
  const { data: levels } = levelHooks.useList();
  const { data: grades } = gradeHooks.useList();
  const { data: tags } = tagHooks.useList();

  const allEmployees = emps?.data ?? [];

  const opts = (list: any[], labelField = 'name') =>
    (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x[labelField] }));

  // Apply the filters to the employee list. Kept client-side for simplicity —
  // the bulk-op pages rarely deal with enormous lists.
  const filtered = useMemo(() => {
    return allEmployees.filter((e: any) => {
      if (filters.company && (typeof e.company === 'object' ? e.company?._id : e.company) !== filters.company) return false;
      if (filters.branch && (typeof e.branch === 'object' ? e.branch?._id : e.branch) !== filters.branch) return false;
      if (filters.department && (typeof e.department === 'object' ? e.department?._id : e.department) !== filters.department) return false;
      if (filters.designation && (typeof e.designation === 'object' ? e.designation?._id : e.designation) !== filters.designation) return false;
      if (filters.level && (typeof e.level === 'object' ? e.level?._id : e.level) !== filters.level) return false;
      if (filters.grade && (typeof e.grade === 'object' ? e.grade?._id : e.grade) !== filters.grade) return false;
      if (filters.tagName && (typeof e.tagName === 'object' ? e.tagName?._id : e.tagName) !== filters.tagName) return false;
      if (filters.employeeGroup && (typeof e.employeeGroup === 'object' ? e.employeeGroup?._id : e.employeeGroup) !== filters.employeeGroup) return false;
      if (filters.employeeName) {
        const nm = `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase();
        if (!nm.includes(filters.employeeName.toLowerCase())) return false;
      }
      if (filters.employeeCode && !(e.employeeId ?? '').includes(filters.employeeCode)) return false;
      if (filters.workId && !(e.workId ?? '').includes(filters.workId)) return false;
      if (filters.aadhaar && !(e.identityDocs?.aadhaarNumber ?? '').includes(filters.aadhaar)) return false;
      if (filters.remark && !(e.empRemark ?? '').toLowerCase().includes(filters.remark.toLowerCase())) return false;
      if (filters.status === 'active' && e.isActive === false) return false;
      if (filters.status === 'in_active' && e.isActive !== false) return false;
      return true;
    });
  }, [allEmployees, filters]);

  const handleAction = () => onAction?.(filters, filtered);

  // The result table shows the filtered employees; pages attach their own
  // extra columns (e.g. inline-edit inputs for new shift/branch/etc.).
  const tableColumns = [
    { title: 'Sr.No.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Code', dataIndex: 'employeeId', width: 110 },
    { title: 'Employee Name', render: (_: any, r: any) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() },
    { title: 'Department', render: (_: any, r: any) => r.department?.name ?? '' },
    { title: 'Designation', render: (_: any, r: any) => r.designation?.name ?? '' },
    { title: 'Shift', render: (_: any, r: any) => r.shift?.name ?? '' },
    ...extraColumns,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
        <Title level={4} className="!mb-0">{title}</Title>
      </div>
      <Card bordered={false}>
        <Form layout="horizontal" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8">
          {includes('employeeName') && (
            <Form.Item label="Employee Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={filters.employeeName} onChange={(e) => setF('employeeName', e.target.value)} allowClear />
            </Form.Item>
          )}
          {includes('employeeCode') && (
            <Form.Item label="Employee Code" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={filters.employeeCode} onChange={(e) => setF('employeeCode', e.target.value)} allowClear />
            </Form.Item>
          )}
          {includes('workId') && (
            <Form.Item label="Work ID" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={filters.workId} onChange={(e) => setF('workId', e.target.value)} allowClear />
            </Form.Item>
          )}
          {includes('company') && (
            <Form.Item label="Company Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} required>
              <Select placeholder="Please Select" allowClear value={filters.company}
                onChange={(v) => setF('company', v)} options={companyOptions} />
            </Form.Item>
          )}
          {includes('branch') && (
            <Form.Item label="Branch Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} required>
              <Select placeholder="Please Select" allowClear value={filters.branch}
                onChange={(v) => setF('branch', v)} options={opts(branches?.data ?? [])} />
            </Form.Item>
          )}
          {includes('department') && (
            <Form.Item label="Department" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.department}
                onChange={(v) => setF('department', v)} options={opts(depts?.data ?? [])} />
            </Form.Item>
          )}
          {includes('designation') && (
            <Form.Item label="Designation" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.designation}
                onChange={(v) => setF('designation', v)} options={opts(desigs?.data ?? [])} />
            </Form.Item>
          )}
          {includes('level') && (
            <Form.Item label="Level Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.level}
                onChange={(v) => setF('level', v)} options={opts(levels?.data ?? [])} />
            </Form.Item>
          )}
          {includes('grade') && (
            <Form.Item label="Grade Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.grade}
                onChange={(v) => setF('grade', v)} options={opts(grades?.data ?? [])} />
            </Form.Item>
          )}
          {includes('tagName') && (
            <Form.Item label="Tag Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.tagName}
                onChange={(v) => setF('tagName', v)} options={opts(tags?.data ?? [])} />
            </Form.Item>
          )}
          {includes('employeeGroup') && (
            <Form.Item label="Employee Group" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Select placeholder="ALL" allowClear value={filters.employeeGroup}
                onChange={(v) => setF('employeeGroup', v)} options={opts(groups?.data ?? [])} />
            </Form.Item>
          )}
          {includes('reportingEmp') && (
            <Form.Item label="Reporting Employee" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} required>
              <Select placeholder="Type atleast 1 character to search"
                showSearch optionFilterProp="label"
                value={filters.reportingEmp} onChange={(v) => setF('reportingEmp', v)}
                options={allEmployees.map((e: any) => ({
                  value: e._id || e.id,
                  label: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim(),
                }))} />
            </Form.Item>
          )}
          {includes('statusAsOnDate') && (
            <Form.Item label="Status As On Date" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full"
                value={filters.statusAsOnDate as any} onChange={(d) => setF('statusAsOnDate', d as any)} />
            </Form.Item>
          )}
          {includes('monthYear') && (
            <Form.Item label="Month Year" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Space.Compact>
                <Select placeholder="Month" value={filters.month} onChange={(v) => setF('month', v)}
                  options={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({ value: m, label: m }))}
                  style={{ width: 100 }} />
                <Select placeholder="Year" value={filters.year} onChange={(v) => setF('year', v)}
                  options={[2024, 2025, 2026, 2027].map((y) => ({ value: String(y), label: String(y) }))}
                  style={{ width: 110 }} />
              </Space.Compact>
            </Form.Item>
          )}
          {includes('status') && (
            <Form.Item label="Status" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Radio.Group value={filters.status} onChange={(e) => setF('status', e.target.value)}>
                <Radio value="active">Active</Radio>
                <Radio value="in_active">In-Active</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          {includes('aadhaar') && (
            <Form.Item label="Aadhaar No." labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={filters.aadhaar} onChange={(e) => setF('aadhaar', e.target.value)} allowClear />
            </Form.Item>
          )}
          {includes('remark') && (
            <Form.Item label="Remark" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Input value={filters.remark} onChange={(e) => setF('remark', e.target.value)} allowClear />
            </Form.Item>
          )}
          {includes('dojDate') && (
            <Form.Item label="DOJ >=" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full"
                value={filters.dojDate as any} onChange={(d) => setF('dojDate', d as any)} />
            </Form.Item>
          )}
          {includes('documentUpload') && (
            <Form.Item label="Document Upload" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Radio.Group value={filters.documentUpload} onChange={(e) => setF('documentUpload', e.target.value)}>
                <Radio value="have">Have</Radio>
                <Radio value="not_attach">Not-Attach</Radio>
                <Radio value="both">Both</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          {includes('vaccineStatus') && (
            <Form.Item label="Vaccine Status" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Radio.Group value={filters.vaccineStatus} onChange={(e) => setF('vaccineStatus', e.target.value)}>
                <Radio value="partially">Partial</Radio>
                <Radio value="fully">Full</Radio>
                <Radio value="not_vaccinated">None</Radio>
                <Radio value="all">All</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>

        {extras && <div className="mt-4">{extras}</div>}

        <Space className="mt-4">
          <Button type="primary" onClick={handleAction}>{actionLabel}</Button>
          {extraButtons}
          <Button onClick={() => setFilters({ status: 'active', documentUpload: 'both', vaccineStatus: 'all' })}>Close</Button>
        </Space>
      </Card>

      {showResultsTable && (
        <Card bordered={false}>
          <div className="text-sm mb-2">Total Employee : {filtered.length} Found</div>
          <Table
            columns={tableColumns as any}
            dataSource={filtered}
            rowKey={(r: any) => r._id || r.id}
            rowSelection={selectable ? {
              selectedRowKeys: selectable.selectedIds,
              onChange: (keys) => selectable.onChange(keys as string[]),
            } : undefined}
            size="small" bordered pagination={{ pageSize: 25, showSizeChanger: true }}
            scroll={{ x: 1200 }}
          />
        </Card>
      )}
    </div>
  );
};

export default EmployeeFilterPanel;
