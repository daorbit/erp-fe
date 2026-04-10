import React, { useState } from 'react';
import { Card, Table, Tag, Button, Tabs, Drawer, Form, Input, InputNumber, Select, Typography, Row, Col, Space, DatePicker, Avatar, Popconfirm } from 'antd';
import { App } from 'antd';
import { IndianRupee, CheckCircle2, CreditCard, Plus, Download } from 'lucide-react';
import { usePayslipList, useSalaryStructureList, useCreateSalaryStructure, useApprovePayslip, useMarkPayslipPaid } from '@/hooks/queries/usePayroll';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useTranslation } from '@/hooks/useTranslation';
import { exportToCsv } from '@/lib/exportCsv';

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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('payslips');
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: empData } = useEmployeeList();
  const employees: any[] = empData?.data ?? [];
  const employeeOptions = employees.map((e: any) => { const u = e.userId || e; return { value: u._id || e._id, label: `${u.firstName || ''} ${u.lastName || ''} (${e.employeeId || ''})`.trim() }; });

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

  // Helper to extract employee name from populated object
  const getEmpName = (r: any) => {
    const e = r.employee;
    if (typeof e === 'object' && e) return `${e.firstName || ''} ${e.lastName || ''}`.trim();
    return r.employeeName || 'N/A';
  };

  const payslipColumns = [
    {
      title: t('employee'), key: 'employee',
      render: (_: any, r: any) => {
        const name = getEmpName(r);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600" size={32}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-gray-400">{typeof r.employee === 'object' ? r.employee?.email : ''}</div>
            </div>
          </div>
        );
      },
    },
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: t('gross'), dataIndex: 'grossEarnings', key: 'grossEarnings', render: (v: number) => formatINR(v || 0) },
    { title: t('deductions'), dataIndex: 'totalDeductions', key: 'totalDeductions', render: (v: number) => formatINR(v || 0) },
    { title: t('net_pay'), dataIndex: 'netPay', key: 'netPay', render: (v: number) => <span className="font-semibold">{formatINR(v || 0)}</span> },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
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
      title: t('actions'), key: 'actions',
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
          <Button size="small" type="link" href={`/payroll/payslip/${r._id || r.id}`}>{t('view')}</Button>
        </Space>
      ),
    },
  ];

  const structureColumns = [
    {
      title: t('employee'), key: 'employee',
      render: (_: any, r: any) => {
        const name = getEmpName(r);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600" size={32}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    { title: 'Basic', dataIndex: 'basic', key: 'basic', render: (v: number) => formatINR(v || 0) },
    { title: 'HRA', dataIndex: 'hra', key: 'hra', render: (v: number) => formatINR(v || 0) },
    { title: 'DA', dataIndex: 'da', key: 'da', render: (v: number) => formatINR(v || 0) },
    { title: 'Special', dataIndex: 'specialAllowance', key: 'specialAllowance', render: (v: number) => formatINR(v || 0) },
    { title: 'Gross', dataIndex: 'grossSalary', key: 'grossSalary', render: (v: number) => <span className="font-semibold">{formatINR(v || 0)}</span> },
    { title: 'Net', dataIndex: 'netSalary', key: 'netSalary', render: (v: number) => formatINR(v || 0) },
  ];

  const handleCreateStructure = (values: any) => {
    const payload: any = {
      employee: values.employeeId,
      basicSalary: values.basic,
      allowances: {
        hra: values.hra || 0,
        da: values.da || 0,
        special: values.specialAllowance || 0,
      },
      effectiveFrom: values.effectiveFrom?.format?.('YYYY-MM-DD') ?? values.effectiveFrom,
    };
    // Remove undefined values
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    createStructureMutation.mutate(payload, {
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
            <Table columns={payslipColumns} dataSource={payslips} loading={payslipsLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
          </Card>
        </div>
      ),
    },
    {
      key: 'structure',
      label: 'Salary Structure',
      children: (
        <Card bordered={false} extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setStructureModalOpen(true)}>Add Structure</Button>}>
          <Table columns={structureColumns} dataSource={structures} loading={structuresLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('payroll')}</Title>
          <Text type="secondary">{t('manage_payroll')}</Text>
        </div>
        <Button icon={<Download size={16} />} onClick={() => exportToCsv(payslips, [
          { key: 'employee', title: 'Employee', render: (_: any, r: any) => getEmpName(r) },
          { key: 'month', title: 'Month' },
          { key: 'year', title: 'Year' },
          { key: 'grossEarnings', title: 'Gross' },
          { key: 'totalDeductions', title: 'Deductions' },
          { key: 'netPay', title: 'Net Pay' },
          { key: 'status', title: 'Status' },
        ], 'payroll')}>{t('export')}</Button>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Drawer title={t('add') + ' ' + t('salary')} open={structureModalOpen} onClose={() => setStructureModalOpen(false)} width={560} destroyOnClose extra={<Space><Button onClick={() => setStructureModalOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={createStructureMutation.isPending} onClick={() => form.submit()}>{t('save')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleCreateStructure}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select placeholder="Search employee..." showSearch optionFilterProp="label" options={employeeOptions} />
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
          <Form.Item name="effectiveFrom" label="Effective From" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PayrollList;
