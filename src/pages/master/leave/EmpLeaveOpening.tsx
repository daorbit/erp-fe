import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Button, Space, Typography, Table, InputNumber, App } from 'antd';
import { useCompanyList } from '@/hooks/queries/useCompanies';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useEmployeeGroupList } from '@/hooks/queries/useEmployeeGroups';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useLeaveTypeList } from '@/hooks/queries/useLeaves';
import { leaveFinyearHooks } from '@/hooks/queries/useMasterOther';
import { useEmpLeaveOpenings, useSaveEmpLeaveOpenings } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

const EmpLeaveOpeningPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [finyearId, setFinyearId] = useState<string | undefined>();
  const [rows, setRows] = useState<any[]>([]);

  const { data: companies } = useCompanyList();
  const { data: branches } = useBranchList();
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: groups } = useEmployeeGroupList();
  const { data: emps } = useEmployeeList();
  const { data: leaveTypes } = useLeaveTypeList();
  const { data: finyears } = leaveFinyearHooks.useList();
  const { data, refetch } = useEmpLeaveOpenings(finyearId ? { finyear: finyearId } : undefined);
  const save = useSaveEmpLeaveOpenings();

  useEffect(() => {
    // Build a matrix of (employee × leaveType) × finyear rows. If server row
    // exists, preload balance; otherwise default to 0.
    if (!finyearId) return;
    const empRows = (emps?.data ?? []);
    const ltRows = (leaveTypes?.data ?? []);
    const existing = new Map<string, any>();
    for (const r of (data?.data ?? [])) {
      const k = `${typeof r.employee === 'object' ? r.employee._id || r.employee.id : r.employee}::${typeof r.leaveType === 'object' ? r.leaveType._id || r.leaveType.id : r.leaveType}`;
      existing.set(k, r);
    }
    const matrix: any[] = [];
    for (const e of empRows) {
      for (const lt of ltRows) {
        const empId = e._id || e.id;
        const ltId = lt._id || lt.id;
        const existingRow = existing.get(`${empId}::${ltId}`);
        matrix.push({
          employee: empId, employeeName: `${e.firstName} ${e.lastName}`.trim(),
          leaveType: ltId, leaveTypeName: lt.name,
          finyear: finyearId,
          openingBalance: existingRow?.openingBalance ?? 0,
        });
      }
    }
    setRows(matrix);
  }, [finyearId, emps, leaveTypes, data]);

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));

  const handleShow = () => {
    if (!finyearId) { message.error('Select a Leave Finyear'); return; }
    refetch();
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync(rows.map((r) => ({
        employee: r.employee, leaveType: r.leaveType, finyear: r.finyear,
        openingBalance: r.openingBalance,
      })));
      message.success('Opening balances saved');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Employee Leave Opening</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8">
          <Form.Item label="Employee Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Input /></Form.Item>
          <Form.Item label="Employee Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Input /></Form.Item>
          <Form.Item label="Company Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select options={opts(companies?.data ?? [])} /></Form.Item>
          <Form.Item label="Branch Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select options={opts(branches?.data ?? [])} /></Form.Item>
          <Form.Item label="Department" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(depts?.data ?? [])} /></Form.Item>
          <Form.Item label="Designation" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(desigs?.data ?? [])} /></Form.Item>
          <Form.Item label="Employee Group" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(groups?.data ?? [])} /></Form.Item>
          <Form.Item label="Leave Finyear" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Please Select" value={finyearId} onChange={setFinyearId}
              options={(finyears?.data ?? []).map((f: any) => ({ value: f._id || f.id, label: f.label || `${f.dateFrom} - ${f.dateTo}` }))} />
          </Form.Item>
        </Form>
        <div className="flex justify-center gap-2 mb-4">
          <Button type="primary" onClick={handleShow}>Show</Button>
          <Button onClick={() => { setFinyearId(undefined); setRows([]); }}>Close</Button>
        </div>

        {finyearId && rows.length > 0 && (
          <>
            <Table
              size="small" bordered
              columns={[
                { title: 'SNo.', render: (_, __, i) => i + 1, width: 70 },
                { title: 'Employee', dataIndex: 'employeeName' },
                { title: 'Leave Type', dataIndex: 'leaveTypeName', width: 200 },
                {
                  title: 'Opening Balance', dataIndex: 'openingBalance', width: 160,
                  render: (v: number, _: any, i: number) => (
                    <InputNumber value={v} min={0}
                      onChange={(x) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, openingBalance: x ?? 0 } : r))}
                    />
                  ),
                },
              ]}
              dataSource={rows}
              rowKey={(r, i) => `${r.employee}::${r.leaveType}::${i}`}
              pagination={{ pageSize: 25 }}
            />
            <div className="flex justify-center mt-4">
              <Space><Button type="primary" onClick={handleSave} loading={save.isPending}>Save</Button></Space>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default EmpLeaveOpeningPage;
