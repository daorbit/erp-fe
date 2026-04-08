/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Modal, Form,
  Select, Row, Col, Tabs, Statistic, DatePicker, Switch, InputNumber, Popconfirm,
} from 'antd';
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock3,
  Calendar,
  Check,
  X,
  Eye,
} from 'lucide-react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Leave Requests mock data
const leaveRequests = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', leaveType: 'Casual Leave', from: '10 Apr 2026', to: '11 Apr 2026', days: 2, reason: 'Personal work', status: 'Pending', appliedOn: '05 Apr 2026' },
  { key: '2', name: 'Priya Singh', department: 'Marketing', leaveType: 'Sick Leave', from: '07 Apr 2026', to: '07 Apr 2026', days: 1, reason: 'Not feeling well', status: 'Approved', appliedOn: '06 Apr 2026' },
  { key: '3', name: 'Amit Patel', department: 'Finance', leaveType: 'Earned Leave', from: '14 Apr 2026', to: '18 Apr 2026', days: 5, reason: 'Family vacation', status: 'Pending', appliedOn: '03 Apr 2026' },
  { key: '4', name: 'Sneha Gupta', department: 'HR', leaveType: 'Casual Leave', from: '01 Apr 2026', to: '01 Apr 2026', days: 1, reason: 'Doctor appointment', status: 'Approved', appliedOn: '30 Mar 2026' },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', leaveType: 'Comp Off', from: '08 Apr 2026', to: '08 Apr 2026', days: 1, reason: 'Worked on Saturday', status: 'Approved', appliedOn: '06 Apr 2026' },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', leaveType: 'Sick Leave', from: '03 Apr 2026', to: '04 Apr 2026', days: 2, reason: 'Fever and cold', status: 'Approved', appliedOn: '03 Apr 2026' },
  { key: '7', name: 'Karan Mehta', department: 'Sales', leaveType: 'Casual Leave', from: '20 Apr 2026', to: '22 Apr 2026', days: 3, reason: 'Wedding ceremony', status: 'Pending', appliedOn: '07 Apr 2026' },
  { key: '8', name: 'Deepika Nair', department: 'Engineering', leaveType: 'Maternity Leave', from: '01 May 2026', to: '27 Oct 2026', days: 180, reason: 'Maternity', status: 'Approved', appliedOn: '15 Mar 2026' },
  { key: '9', name: 'Rajesh Kumar', department: 'Finance', leaveType: 'Earned Leave', from: '25 Apr 2026', to: '30 Apr 2026', days: 4, reason: 'Hometown visit', status: 'Rejected', appliedOn: '04 Apr 2026' },
  { key: '10', name: 'Meera Iyer', department: 'Marketing', leaveType: 'Loss of Pay', from: '12 Apr 2026', to: '12 Apr 2026', days: 1, reason: 'Personal emergency', status: 'Pending', appliedOn: '08 Apr 2026' },
  { key: '11', name: 'Suresh Pillai', department: 'HR', leaveType: 'Paternity Leave', from: '15 Apr 2026', to: '29 Apr 2026', days: 15, reason: 'Paternity', status: 'Approved', appliedOn: '01 Apr 2026' },
];

// Leave Types mock data
const leaveTypes = [
  { key: '1', name: 'Casual Leave', code: 'CL', defaultDays: 12, carryForward: false, paid: true, applicableFor: 'All', status: 'Active' },
  { key: '2', name: 'Sick Leave', code: 'SL', defaultDays: 8, carryForward: false, paid: true, applicableFor: 'All', status: 'Active' },
  { key: '3', name: 'Earned Leave', code: 'EL', defaultDays: 15, carryForward: true, paid: true, applicableFor: 'All', status: 'Active' },
  { key: '4', name: 'Maternity Leave', code: 'ML', defaultDays: 180, carryForward: false, paid: true, applicableFor: 'Female', status: 'Active' },
  { key: '5', name: 'Paternity Leave', code: 'PL', defaultDays: 15, carryForward: false, paid: true, applicableFor: 'Male', status: 'Active' },
  { key: '6', name: 'Comp Off', code: 'CO', defaultDays: 0, carryForward: false, paid: true, applicableFor: 'All', status: 'Active' },
  { key: '7', name: 'Loss of Pay', code: 'LOP', defaultDays: 0, carryForward: false, paid: false, applicableFor: 'All', status: 'Active' },
];

// Leave Balances mock data
const leaveBalances = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', cl: { allocated: 12, used: 3, remaining: 9 }, sl: { allocated: 8, used: 1, remaining: 7 }, el: { allocated: 15, used: 5, remaining: 10 } },
  { key: '2', name: 'Priya Singh', department: 'Marketing', cl: { allocated: 12, used: 5, remaining: 7 }, sl: { allocated: 8, used: 2, remaining: 6 }, el: { allocated: 15, used: 0, remaining: 15 } },
  { key: '3', name: 'Amit Patel', department: 'Finance', cl: { allocated: 12, used: 2, remaining: 10 }, sl: { allocated: 8, used: 0, remaining: 8 }, el: { allocated: 15, used: 8, remaining: 7 } },
  { key: '4', name: 'Sneha Gupta', department: 'HR', cl: { allocated: 12, used: 4, remaining: 8 }, sl: { allocated: 8, used: 3, remaining: 5 }, el: { allocated: 15, used: 2, remaining: 13 } },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', cl: { allocated: 12, used: 1, remaining: 11 }, sl: { allocated: 8, used: 0, remaining: 8 }, el: { allocated: 15, used: 3, remaining: 12 } },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', cl: { allocated: 12, used: 6, remaining: 6 }, sl: { allocated: 8, used: 4, remaining: 4 }, el: { allocated: 15, used: 10, remaining: 5 } },
  { key: '7', name: 'Karan Mehta', department: 'Sales', cl: { allocated: 12, used: 0, remaining: 12 }, sl: { allocated: 8, used: 1, remaining: 7 }, el: { allocated: 15, used: 0, remaining: 15 } },
  { key: '8', name: 'Rajesh Kumar', department: 'Finance', cl: { allocated: 12, used: 7, remaining: 5 }, sl: { allocated: 8, used: 2, remaining: 6 }, el: { allocated: 15, used: 6, remaining: 9 } },
];

const LeaveList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeForm] = Form.useForm();

  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status === 'Rejected').length;
  const totalDaysUsed = leaveRequests.filter(l => l.status === 'Approved').reduce((sum, l) => sum + l.days, 0);

  const statsCards = [
    { title: 'Pending Approval', value: pendingCount, icon: <Clock3 size={20} />, color: '#d97706' },
    { title: 'Approved This Month', value: approvedCount, icon: <CheckCircle2 size={20} />, color: '#059669' },
    { title: 'Rejected', value: rejectedCount, icon: <XCircle size={20} />, color: '#dc2626' },
    { title: 'Total Days Used', value: totalDaysUsed, icon: <Calendar size={20} />, color: '#2563eb' },
  ];

  const statusColorMap: Record<string, string> = {
    Pending: 'orange',
    Approved: 'green',
    Rejected: 'red',
  };

  const leaveTypeColorMap: Record<string, string> = {
    'Casual Leave': 'blue',
    'Sick Leave': 'red',
    'Earned Leave': 'green',
    'Maternity Leave': 'pink',
    'Paternity Leave': 'cyan',
    'Comp Off': 'purple',
    'Loss of Pay': 'default',
  };

  const filteredRequests = leaveRequests.filter(l => {
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesSearch = !searchText ||
      l.name.toLowerCase().includes(searchText.toLowerCase()) ||
      l.department.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const requestColumns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType',
      render: (type: string) => <Tag color={leaveTypeColorMap[type]}>{type}</Tag>,
    },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    { title: 'Days', dataIndex: 'days', key: 'days', render: (d: number) => <Text strong>{d}</Text> },
    {
      title: 'Reason', dataIndex: 'reason', key: 'reason',
      ellipsis: true,
      render: (r: string) => <Text type="secondary">{r}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColorMap[status]}>{status}</Tag>,
    },
    { title: 'Applied On', dataIndex: 'appliedOn', key: 'appliedOn' },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'Pending' ? (
            <>
              <Popconfirm title="Approve this leave request?" onConfirm={() => {}}>
                <Button type="text" size="small" style={{ color: '#059669' }} icon={<Check size={16} />} />
              </Popconfirm>
              <Popconfirm title="Reject this leave request?" onConfirm={() => {}}>
                <Button type="text" size="small" danger icon={<X size={16} />} />
              </Popconfirm>
            </>
          ) : (
            <Button type="text" size="small" icon={<Eye size={16} />} />
          )}
        </Space>
      ),
    },
  ];

  const typeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Default Days', dataIndex: 'defaultDays', key: 'defaultDays', render: (d: number) => <Text strong>{d || '-'}</Text> },
    {
      title: 'Carry Forward', dataIndex: 'carryForward', key: 'carryForward',
      render: (cf: boolean) => cf ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      title: 'Paid', dataIndex: 'paid', key: 'paid',
      render: (p: boolean) => p ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: 'Applicable For', dataIndex: 'applicableFor', key: 'applicableFor',
      render: (a: string) => <Tag color={a === 'All' ? 'blue' : a === 'Female' ? 'pink' : 'cyan'}>{a}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'default'}>{s}</Tag>,
    },
  ];

  const balanceColumns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    {
      title: 'Casual Leave', key: 'cl',
      children: [
        { title: 'Alloc', dataIndex: ['cl', 'allocated'], key: 'cl_a', width: 60 },
        { title: 'Used', dataIndex: ['cl', 'used'], key: 'cl_u', width: 60, render: (v: number) => <Text type={v > 0 ? 'danger' : undefined}>{v}</Text> },
        { title: 'Left', dataIndex: ['cl', 'remaining'], key: 'cl_r', width: 60, render: (v: number) => <Text strong style={{ color: '#059669' }}>{v}</Text> },
      ],
    },
    {
      title: 'Sick Leave', key: 'sl',
      children: [
        { title: 'Alloc', dataIndex: ['sl', 'allocated'], key: 'sl_a', width: 60 },
        { title: 'Used', dataIndex: ['sl', 'used'], key: 'sl_u', width: 60, render: (v: number) => <Text type={v > 0 ? 'danger' : undefined}>{v}</Text> },
        { title: 'Left', dataIndex: ['sl', 'remaining'], key: 'sl_r', width: 60, render: (v: number) => <Text strong style={{ color: '#059669' }}>{v}</Text> },
      ],
    },
    {
      title: 'Earned Leave', key: 'el',
      children: [
        { title: 'Alloc', dataIndex: ['el', 'allocated'], key: 'el_a', width: 60 },
        { title: 'Used', dataIndex: ['el', 'used'], key: 'el_u', width: 60, render: (v: number) => <Text type={v > 0 ? 'danger' : undefined}>{v}</Text> },
        { title: 'Left', dataIndex: ['el', 'remaining'], key: 'el_r', width: 60, render: (v: number) => <Text strong style={{ color: '#059669' }}>{v}</Text> },
      ],
    },
  ];

  const filteredBalances = leaveBalances.filter(b =>
    !searchText || b.name.toLowerCase().includes(searchText.toLowerCase()) ||
    b.department.toLowerCase().includes(searchText.toLowerCase())
  );

  const tabItems = [
    {
      key: 'requests',
      label: 'Leave Requests',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {statsCards.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Statistic
                      title={<Text type="secondary">{stat.title}</Text>}
                      value={stat.value}
                      valueStyle={{ fontSize: 28, fontWeight: 700 }}
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

          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Space wrap>
                <Input
                  placeholder="Search employees..."
                  prefix={<Search size={16} />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  placeholder="Status"
                  allowClear
                  style={{ width: 140 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' },
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
                <Select
                  placeholder="Leave Type"
                  allowClear
                  style={{ width: 160 }}
                  options={leaveTypes.map(t => ({ value: t.name, label: t.name }))}
                />
              </Space>
              <RangePicker />
            </Space>
            <Table
              dataSource={filteredRequests}
              columns={requestColumns}
              pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} requests` }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'types',
      label: 'Leave Types',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsTypeModalOpen(true)}>
              Add Leave Type
            </Button>
          </div>
          <Table
            dataSource={leaveTypes}
            columns={typeColumns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} leave types` }}
          />
        </Card>
      ),
    },
    {
      key: 'balances',
      label: 'Leave Balances',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search employees..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
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
          <Table
            dataSource={filteredBalances}
            columns={balanceColumns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} employees` }}
            bordered
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
          <Title level={3} style={{ margin: 0 }}>Leave Management</Title>
          <Text type="secondary">Manage leave requests, types and balances</Text>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title="Add Leave Type"
        open={isTypeModalOpen}
        onCancel={() => { setIsTypeModalOpen(false); typeForm.resetFields(); }}
        onOk={() => { typeForm.validateFields().then(() => { setIsTypeModalOpen(false); typeForm.resetFields(); }); }}
        width={560}
      >
        <Form form={typeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Leave Type Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Casual Leave" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                <Input placeholder="e.g. CL" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="defaultDays" label="Default Days" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="12" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="applicableFor" label="Applicable For" rules={[{ required: true }]}>
                <Select
                  placeholder="Select"
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="paid" label="Paid Leave" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="carryForward" label="Carry Forward" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveList;
