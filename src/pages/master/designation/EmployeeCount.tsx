import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, Button, Space, Typography, Table, Empty, App } from 'antd';
import { useBranchList } from '@/hooks/queries/useBranches';
import designationService from '@/services/designationService';
import { useCompanyList } from '@/hooks/queries/useCompanies';
import { useAppSelector } from '@/store';

const { Title } = Typography;

// "No of Employee Designation" — pick Company + Branch, press Show, see a
// table of Designation | Count for that scope. Branch filter goes through
// Department.branches on the backend (User has no direct branch field).
const DesignationEmployeeCount: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const user = useAppSelector((s) => s.auth.user);

  const { data: branchListData } = useBranchList();
  const branches = branchListData?.data ?? [];

  // Company list — only super_admin can pick across companies; others get their own.
  const { data: companyListData } = useCompanyList();
  const companies = companyListData?.data ?? [];

  const userCompanyId =
    typeof user?.company === 'object' ? user?.company?._id || user?.company?.id : user?.company;

  const [rows, setRows] = useState<Array<{ designationId: string; designationName: string; shortName: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const handleShow = async (values: { companyId: string; branchId?: string }) => {
    try {
      setLoading(true);
      const res = await designationService.employeeCount(
        values.branchId ? { branch: values.branchId } : undefined,
      );
      setRows(res?.data ?? []);
      setShown(true);
    } catch (err: any) {
      message.error(err?.message || 'Failed to load employee counts');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'SNo.', width: 70, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Designation', dataIndex: 'designationName', key: 'name' },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', width: 150 },
    { title: 'Employee Count', dataIndex: 'count', key: 'count', width: 160, align: 'right' as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">No of Employee Designation</Title>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleShow}
          initialValues={{ companyId: userCompanyId }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Form.Item name="companyId" label="Company Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
            rules={[{ required: true, message: 'Company is required' }]}>
            <Select
              placeholder="Please Select"
              // Regular admins belong to exactly one company and can't switch.
              disabled={user?.role !== 'super_admin'}
              options={
                user?.role === 'super_admin'
                  ? companies.map((c: any) => ({ value: c._id || c.id, label: c.name }))
                  : companies
                      .filter((c: any) => (c._id || c.id) === userCompanyId)
                      .map((c: any) => ({ value: c._id || c.id, label: c.name }))
              }
            />
          </Form.Item>
          <Form.Item name="branchId" label="Branch Name" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Select
              placeholder="All branches"
              allowClear
              options={branches.map((b: any) => ({ value: b._id || b.id, label: b.name }))}
            />
          </Form.Item>
          <div className="col-span-full flex justify-center">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>Show</Button>
              <Button onClick={() => navigate('/master/designation/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      {shown && (
        <Card bordered={false}>
          {rows.length === 0 ? (
            <Empty description="No employees found for this scope." />
          ) : (
            <Table columns={columns} dataSource={rows} rowKey="designationId"
              pagination={false} size="small" bordered
              summary={(data) => {
                const total = data.reduce((s: number, r: any) => s + (r.count ?? 0), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">Total</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right"><b>{total}</b></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default DesignationEmployeeCount;
