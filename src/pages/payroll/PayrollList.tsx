import React, { useState } from 'react';
import { Card, Table, Tag, Button, Tabs, Modal, Form, Input, InputNumber, Select, Typography, Row, Col, Space, DatePicker, Avatar, Popconfirm } from 'antd';
import { App } from 'antd';
import { IndianRupee, CheckCircle2, CreditCard, Plus, Download } from 'lucide-react';
import { usePayslipList, useSalaryStructureList, useCreateSalaryStructure, useApprovePayslip, useMarkPayslipPaid } from '@/hooks/queries/usePayroll';

const { Title, Text } = Typography;

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const statusColor: Record<string, string> = {
  draft: 'default',
  generated: 'blue',
  approved: 'orange',
  paid: 'green',
  cancelled: 'red',
};

const PayrollList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: payslipData, isLoading: payslipsLoading } = usePayslipList();
  const { data: structureData, isLoading: structuresLoading } = useSalaryStructureList();
  const createStructureMutation = useCreateSalaryStructure();
  const approveMutation = useApprovePayslip();
  const markPaidMutation = useMarkPayslipPaid();

  const payslips: any[] = payslipData?.data ?? [];
  const structures: any[] = structureData?.data ?? [];

  const totalCost = payslips.reduce((sum, p) => sum + (p.netPay || 0), 0);
  const processed = payslips.filter(p => ['approved', 'paid'].includes(p.status)).length;
  const paid = payslips.filter(p => p.status === 'paid').length;

  const stats = [
    { title: 'Total Cost', value: formatINR(totalCost), icon: <IndianRupee size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Processed', value: processed, icon: <CheckCircle2 size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Paid', value: paid, icon: <CreditCard size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
  ];

  const payslipColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <div>
            <div className="font-medium text-sm">{r.employeeName}</div>
            <div className="text-xs text-gray-400">{r.employeeId}</div>
          </div>
        </div>
      ),
    },
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Basic', dataIndex: 'basicPay', key: 'basicPay', render: (v: number) => formatINR(v || 0) },
    { title: 'Gross', dataIndex: 'grossPay', key: 'grossPay', render: (v: number) => formatINR(v || 0) },
    { title: 'Deductions', dataIndex: 'totalDeductions', key: 'totalDeductions', render: (v: number) => formatINR(v || 0) },
    { title: 'Net Pay', dataIndex: 'netPay', key: 'netPay', render: (v: number) => <span className="font-semibold">{formatINR(v || 0)}</span> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Generated', value: 'generated' },
        { text: 'Approved', value: 'approved' },
        { text: 'Paid', value: 'paid' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          {r.status === 'generated' && (
            <Popconfirm title="Approve this payslip?" onConfirm={() => approveMutation.mutate(r._id || r.id, { onSuccess: () => message.success('Payslip approved') })}>
              <Button size="small" type="link"><CheckCircle2 size={16} /></Button>
            </Popconfirm>
          )}
          {r.status === 'approved' && (
            <Popconfirm title="Mark as paid?" onConfirm={() => markPaidMutation.mutate({ id: r._id || r.id }, { onSuccess: () => message.success('Marked as paid') })}>
              <Button size="small" type="link" className="!text-green-600"><CreditCard size={16} /></Button>
            </Popconfirm>
          )}
          <Button size="small" type="link" href={`/payroll/payslip/${r._id || r.id}`}>View</Button>
        </Space>
      ),
    },
  ];

  const structureColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <span className="font-medium">{r.employeeName}</span>
        </div>
      ),
    },
    { title: 'Basic', dataIndex: 'basic', key: 'basic', render: (v: number) => formatINR(v || 0) },
    { title: 'HRA', dataIndex: 'hra', key: 'hra', render: (v: number) => formatINR(v || 0) },
    { title: 'DA', dataIndex: 'da', key: 'da', render: (v: number) => formatINR(v || 0) },
    { title: 'Special Allowance', dataIndex: 'specialAllowance', key: 'specialAllowance', render: (v: number) => formatINR(v || 0) },
    { title: 'Gross', dataIndex: 'gross', key: 'gross', render: (v: number) => <span className="font-semibold">{formatINR(v || 0)}</span> },
  ];

  const handleCreateStructure = (values: any) => {
    createStructureMutation.mutate(values, {
      onSuccess: () => {
        message.success('Salary structure created');
        setStructureModalOpen(false);
        form.resetFields();
      },
    });
  };

  const tabItems = [
    {
      key: 'payslips',
      label: 'Payslips',
      children: (
        <div className="space-y-4">
          <Row gutter={[16, 16]}>
            {stats.map((stat, i) => (
              <Col key={i} xs={24} sm={8}>
                <Card bordered={false}>
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">{stat.title}</Text>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Card bordered={false}>
            <Table columns={payslipColumns} dataSource={payslips} loading={payslipsLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
          </Card>
        </div>
      ),
    },
    {
      key: 'structure',
      label: 'Salary Structure',
      children: (
        <Card bordered={false} extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setStructureModalOpen(true)}>Add Structure</Button>}>
          <Table columns={structureColumns} dataSource={structures} loading={structuresLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Payroll</Title>
          <Text type="secondary">Manage employee payroll and salary structures</Text>
        </div>
        <Button icon={<Download size={16} />}>Export</Button>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title="Add Salary Structure" open={structureModalOpen} onCancel={() => setStructureModalOpen(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreateStructure}>
          <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
            <Input placeholder="Employee ID" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="basic" label="Basic" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" prefix="₹" />
            </Form.Item>
            <Form.Item name="hra" label="HRA" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" prefix="₹" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="da" label="DA">
              <InputNumber min={0} className="w-full" prefix="₹" />
            </Form.Item>
            <Form.Item name="specialAllowance" label="Special Allowance">
              <InputNumber min={0} className="w-full" prefix="₹" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setStructureModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createStructureMutation.isPending}>Create</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PayrollList;
