/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Modal, Form,
  Select, Row, Col, Tabs, Statistic, DatePicker, InputNumber, Popconfirm,
} from 'antd';
import {
  Search,
  Plus,
  IndianRupee,
  Users,
  Clock3,
  CheckCircle2,
  Eye,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const formatINR = (amount: number) => {
  return '₹' + amount.toLocaleString('en-IN');
};

// Payslips mock data
const payslips = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP001', department: 'Engineering', gross: 125000, deductions: 27500, net: 97500, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '2', name: 'Priya Singh', empId: 'EMP002', department: 'Marketing', gross: 95000, deductions: 20900, net: 74100, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '3', name: 'Amit Patel', empId: 'EMP003', department: 'Finance', gross: 110000, deductions: 24200, net: 85800, status: 'Approved', paymentDate: '-' },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP004', department: 'HR', gross: 85000, deductions: 18700, net: 66300, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP005', department: 'Sales', gross: 75000, deductions: 16500, net: 58500, status: 'Generated', paymentDate: '-' },
  { key: '6', name: 'Ananya Reddy', empId: 'EMP006', department: 'Engineering', gross: 150000, deductions: 33000, net: 117000, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '7', name: 'Karan Mehta', empId: 'EMP007', department: 'Sales', gross: 65000, deductions: 14300, net: 50700, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '8', name: 'Deepika Nair', empId: 'EMP008', department: 'Engineering', gross: 130000, deductions: 28600, net: 101400, status: 'Draft', paymentDate: '-' },
  { key: '9', name: 'Rajesh Kumar', empId: 'EMP009', department: 'Finance', gross: 90000, deductions: 19800, net: 70200, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '10', name: 'Meera Iyer', empId: 'EMP010', department: 'Marketing', gross: 80000, deductions: 17600, net: 62400, status: 'Generated', paymentDate: '-' },
  { key: '11', name: 'Suresh Pillai', empId: 'EMP011', department: 'HR', gross: 70000, deductions: 15400, net: 54600, status: 'Approved', paymentDate: '-' },
  { key: '12', name: 'Neha Deshmukh', empId: 'EMP012', department: 'Engineering', gross: 140000, deductions: 30800, net: 109200, status: 'Paid', paymentDate: '01 Apr 2026' },
  { key: '13', name: 'Arjun Malhotra', empId: 'EMP013', department: 'Sales', gross: 55000, deductions: 12100, net: 42900, status: 'Generated', paymentDate: '-' },
  { key: '14', name: 'Pooja Verma', empId: 'EMP014', department: 'Finance', gross: 25000, deductions: 5500, net: 19500, status: 'Draft', paymentDate: '-' },
];

// Salary Structure mock data
const salaryStructures = [
  { key: '1', name: 'Rahul Sharma', basic: 50000, hra: 25000, da: 12500, specialAllowance: 25000, gross: 125000, pf: 6000, esi: 0, pt: 200, tds: 21300, net: 97500, ctc: 1800000, effectiveFrom: '01 Jan 2026' },
  { key: '2', name: 'Priya Singh', basic: 38000, hra: 19000, da: 9500, specialAllowance: 19000, gross: 95000, pf: 4560, esi: 0, pt: 200, tds: 16140, net: 74100, ctc: 1368000, effectiveFrom: '01 Jan 2026' },
  { key: '3', name: 'Amit Patel', basic: 44000, hra: 22000, da: 11000, specialAllowance: 22000, gross: 110000, pf: 5280, esi: 0, pt: 200, tds: 18720, net: 85800, ctc: 1584000, effectiveFrom: '01 Jan 2026' },
  { key: '4', name: 'Sneha Gupta', basic: 34000, hra: 17000, da: 8500, specialAllowance: 17000, gross: 85000, pf: 4080, esi: 0, pt: 200, tds: 14420, net: 66300, ctc: 1224000, effectiveFrom: '01 Apr 2026' },
  { key: '5', name: 'Vikram Joshi', basic: 30000, hra: 15000, da: 7500, specialAllowance: 15000, gross: 75000, pf: 3600, esi: 0, pt: 200, tds: 12700, net: 58500, ctc: 1080000, effectiveFrom: '01 Jan 2026' },
  { key: '6', name: 'Ananya Reddy', basic: 60000, hra: 30000, da: 15000, specialAllowance: 30000, gross: 150000, pf: 7200, esi: 0, pt: 200, tds: 25600, net: 117000, ctc: 2160000, effectiveFrom: '01 Jan 2026' },
  { key: '7', name: 'Karan Mehta', basic: 26000, hra: 13000, da: 6500, specialAllowance: 13000, gross: 65000, pf: 3120, esi: 0, pt: 200, tds: 10980, net: 50700, ctc: 936000, effectiveFrom: '01 Jan 2026' },
  { key: '8', name: 'Deepika Nair', basic: 52000, hra: 26000, da: 13000, specialAllowance: 26000, gross: 130000, pf: 6240, esi: 0, pt: 200, tds: 22160, net: 101400, ctc: 1872000, effectiveFrom: '01 Jan 2026' },
];

const PayrollList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureForm] = Form.useForm();
  const navigate = useNavigate();

  const totalPayroll = payslips.reduce((sum, p) => sum + p.net, 0);
  const paidCount = payslips.filter(p => p.status === 'Paid').length;
  const pendingCount = payslips.filter(p => p.status === 'Approved' || p.status === 'Generated').length;

  const statsCards = [
    { title: 'Total Payroll Cost', value: formatINR(totalPayroll), icon: <IndianRupee size={20} />, color: '#1a56db' },
    { title: 'Employees Processed', value: payslips.length, icon: <Users size={20} />, color: '#059669' },
    { title: 'Pending Approval', value: pendingCount, icon: <Clock3 size={20} />, color: '#d97706' },
    { title: 'Paid', value: paidCount, icon: <CheckCircle2 size={20} />, color: '#059669' },
  ];

  const statusColorMap: Record<string, string> = {
    Draft: 'default',
    Generated: 'blue',
    Approved: 'orange',
    Paid: 'green',
  };

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.empId.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const payslipColumns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.empId}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Gross', dataIndex: 'gross', key: 'gross', render: (v: number) => <Text>{formatINR(v)}</Text>, align: 'right' as const },
    { title: 'Deductions', dataIndex: 'deductions', key: 'deductions', render: (v: number) => <Text type="danger">{formatINR(v)}</Text>, align: 'right' as const },
    { title: 'Net Pay', dataIndex: 'net', key: 'net', render: (v: number) => <Text strong style={{ color: '#059669' }}>{formatINR(v)}</Text>, align: 'right' as const },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColorMap[status]}>{status}</Tag>,
    },
    { title: 'Payment Date', dataIndex: 'paymentDate', key: 'paymentDate' },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={16} />} onClick={() => navigate(`/payroll/payslip/${record.key}`)} />
          {record.status === 'Generated' && (
            <Popconfirm title="Approve this payslip?" onConfirm={() => {}}>
              <Button type="text" size="small" style={{ color: '#059669' }} icon={<Check size={16} />} />
            </Popconfirm>
          )}
          {record.status === 'Approved' && (
            <Popconfirm title="Mark as paid?" onConfirm={() => {}}>
              <Button type="text" size="small" style={{ color: '#1a56db' }} icon={<IndianRupee size={16} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const structureColumns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      fixed: 'left' as const,
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }} size="small">{text[0]}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    { title: 'Basic', dataIndex: 'basic', key: 'basic', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'HRA', dataIndex: 'hra', key: 'hra', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'DA', dataIndex: 'da', key: 'da', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'Spl. Allowance', dataIndex: 'specialAllowance', key: 'specialAllowance', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'Gross', dataIndex: 'gross', key: 'gross', render: (v: number) => <Text strong>{formatINR(v)}</Text>, align: 'right' as const },
    { title: 'PF', dataIndex: 'pf', key: 'pf', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'ESI', dataIndex: 'esi', key: 'esi', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'PT', dataIndex: 'pt', key: 'pt', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'TDS', dataIndex: 'tds', key: 'tds', render: (v: number) => formatINR(v), align: 'right' as const },
    { title: 'Net', dataIndex: 'net', key: 'net', render: (v: number) => <Text strong style={{ color: '#059669' }}>{formatINR(v)}</Text>, align: 'right' as const },
    { title: 'CTC (Annual)', dataIndex: 'ctc', key: 'ctc', render: (v: number) => <Text strong>{formatINR(v)}</Text>, align: 'right' as const },
    { title: 'Effective From', dataIndex: 'effectiveFrom', key: 'effectiveFrom' },
  ];

  const tabItems = [
    {
      key: 'payslips',
      label: 'Payslips',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Space wrap>
              <Input
                placeholder="Search by name or ID..."
                prefix={<Search size={16} />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 260 }}
              />
              <Select
                placeholder="Status"
                allowClear
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Generated', label: 'Generated' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Paid', label: 'Paid' },
                ]}
              />
              <Select
                placeholder="Department"
                allowClear
                style={{ width: 160 }}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Sales', label: 'Sales' },
                ]}
              />
            </Space>
          </Space>
          <Table
            dataSource={filteredPayslips}
            columns={payslipColumns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} payslips` }}
          />
        </Card>
      ),
    },
    {
      key: 'structure',
      label: 'Salary Structure',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsStructureModalOpen(true)}>
              Add Structure
            </Button>
          </div>
          <Table
            dataSource={salaryStructures}
            columns={structureColumns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} records` }}
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Payroll Management</Title>
          <Text type="secondary">Manage employee payroll and salary structures</Text>
        </div>
        <Space>
          <DatePicker picker="month" style={{ width: 180 }} />
          <Button icon={<FileText size={16} />}>Generate Payslips</Button>
          <Button type="primary" icon={<Download size={16} />}>Bulk Generate</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary">{stat.title}</Text>}
                  value={stat.value}
                  valueStyle={{ fontSize: index === 0 ? 22 : 28, fontWeight: 700 }}
                  formatter={(value) => <span>{value}</span>}
                />
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${stat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title="Add Salary Structure"
        open={isStructureModalOpen}
        onCancel={() => { setIsStructureModalOpen(false); structureForm.resetFields(); }}
        onOk={() => { structureForm.validateFields().then(() => { setIsStructureModalOpen(false); structureForm.resetFields(); }); }}
        width={720}
      >
        <Form form={structureForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employee" label="Employee" rules={[{ required: true }]}>
                <Select
                  placeholder="Select employee"
                  showSearch
                  optionFilterProp="label"
                  options={payslips.map(e => ({ value: e.key, label: `${e.name} (${e.empId})` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="effectiveFrom" label="Effective From" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>Earnings</Text>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="basic" label="Basic" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="hra" label="HRA" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="da" label="DA">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="specialAllowance" label="Special Allowance">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>Deductions</Text>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="pf" label="PF">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="esi" label="ESI">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="pt" label="Professional Tax">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tds" label="TDS">
                <InputNumber style={{ width: '100%' }} prefix="₹" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PayrollList;
