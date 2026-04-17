import React, { useState } from 'react';
import { Card, Form, Select, Input, Button, Space, Typography, Table, App } from 'antd';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useEmployeeGroupList } from '@/hooks/queries/useEmployeeGroups';
import { leaveFinyearHooks } from '@/hooks/queries/useMasterOther';
import { useClosingLeaveTransfers, useRunClosingLeaveTransfer } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

const ClosingLeaveTransferPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [fromFinyear, setFromFinyear] = useState<string | undefined>();
  const [toFinyear, setToFinyear] = useState<string | undefined>();

  const { data: myCompanyData } = useMyCompany();
  const companyOptions = myCompanyData?.data
    ? [{ value: myCompanyData.data._id || myCompanyData.data.id, label: myCompanyData.data.name }]
    : [];
  const { data: branches } = useBranchList();
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: groups } = useEmployeeGroupList();
  const { data: finyears } = leaveFinyearHooks.useList();
  const { data, refetch } = useClosingLeaveTransfers(fromFinyear && toFinyear ? { fromFinyear, toFinyear } : undefined);
  const runTransfer = useRunClosingLeaveTransfer();

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));
  const fyOpts = (finyears?.data ?? []).map((f: any) => ({ value: f._id || f.id, label: f.label }));

  const handleShow = () => {
    if (!fromFinyear || !toFinyear) { message.error('Pick both finyears'); return; }
    refetch();
  };

  const handleConfirm = () => {
    modal.confirm({
      title: 'Run closing transfer?',
      content: 'All eligible leave balances from the source finyear will be moved to the target finyear following each leave type\'s carry-forward rule.',
      okText: 'Transfer',
      okButtonProps: { danger: true },
      onOk: async () => {
        // For scaffolding the transfer we just pass the rows that the server already returned
        try {
          await runTransfer.mutateAsync((data?.data ?? []));
          message.success('Transfer recorded');
        } catch (err: any) { message.error(err?.message || 'Failed'); }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Closing Leave Transfer</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8">
          <Form.Item label="Employee Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Input /></Form.Item>
          <Form.Item label="Employee Code" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Input /></Form.Item>
          <Form.Item label="Company Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select options={companyOptions} /></Form.Item>
          <Form.Item label="Branch Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select options={opts(branches?.data ?? [])} /></Form.Item>
          <Form.Item label="Department" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(depts?.data ?? [])} /></Form.Item>
          <Form.Item label="Designation" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(desigs?.data ?? [])} /></Form.Item>
          <Form.Item label="Employee Group" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Select allowClear placeholder="ALL" options={opts(groups?.data ?? [])} /></Form.Item>
          <Form.Item label="Leave Finyear From" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Please Select" value={fromFinyear} onChange={setFromFinyear} options={fyOpts} />
          </Form.Item>
          <Form.Item label="To" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Select placeholder="Please Select" value={toFinyear} onChange={setToFinyear} options={fyOpts} />
          </Form.Item>
        </Form>
        <div className="flex justify-center gap-2 mb-4">
          <Button type="primary" onClick={handleShow}>Show</Button>
          <Button onClick={handleConfirm} disabled={!data?.data?.length} danger>Run Transfer</Button>
        </div>

        <Table
          size="small" bordered
          columns={[
            { title: 'SNo.', render: (_, __, i) => i + 1, width: 70 },
            { title: 'Employee', render: (_: any, r: any) => r.employee && typeof r.employee === 'object' ? `${r.employee.firstName} ${r.employee.lastName}` : '' },
            { title: 'Leave Type', render: (_: any, r: any) => r.leaveType?.name },
            { title: 'Closing Bal', dataIndex: 'closingBalance', width: 130 },
            { title: 'Transferred', dataIndex: 'transferredBalance', width: 130 },
          ]}
          dataSource={data?.data ?? []}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default ClosingLeaveTransferPage;
