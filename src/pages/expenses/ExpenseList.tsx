/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Drawer, Form,
  Select, Row, Col, Statistic, Tabs, Upload, DatePicker, Dropdown, Tooltip, InputNumber,
} from 'antd';
import {
  Plus, Search, Eye, Edit2, Send, CheckCircle2, XCircle, MoreHorizontal,
  SlidersHorizontal, Receipt, Clock, IndianRupee, TrendingUp, Paperclip,
} from 'lucide-react';

const { Title, Text } = Typography;

interface Expense {
  key: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Reimbursed';
  submittedOn: string | null;
  approvedBy: string | null;
  employee: string;
  description: string;
  receipts: number;
}

const expenses: Expense[] = [
  { key: '1', title: 'Client Meeting Lunch - Infosys', category: 'Meals & Entertainment', amount: 2500, date: '2026-04-02', status: 'Approved', submittedOn: '2026-04-03', approvedBy: 'Priya Singh', employee: 'Rahul Sharma', description: 'Lunch with Infosys team for project discussion', receipts: 1 },
  { key: '2', title: 'Travel to Pune - Client Visit', category: 'Travel', amount: 8500, date: '2026-03-28', status: 'Reimbursed', submittedOn: '2026-03-29', approvedBy: 'Ananya Reddy', employee: 'Vikram Joshi', description: 'Round trip Pune travel for client meeting', receipts: 3 },
  { key: '3', title: 'Office Supplies - Stationery', category: 'Office Supplies', amount: 1200, date: '2026-04-05', status: 'Submitted', submittedOn: '2026-04-05', approvedBy: null, employee: 'Sneha Gupta', description: 'Notepads, pens, and whiteboard markers for team', receipts: 1 },
  { key: '4', title: 'AWS Certification Training', category: 'Training', amount: 15000, date: '2026-03-15', status: 'Approved', submittedOn: '2026-03-16', approvedBy: 'Ananya Reddy', employee: 'Amit Patel', description: 'AWS Solutions Architect Professional certification course', receipts: 1 },
  { key: '5', title: 'Team Dinner - Sprint Completion', category: 'Meals & Entertainment', amount: 6800, date: '2026-04-01', status: 'Under Review', submittedOn: '2026-04-02', approvedBy: null, employee: 'Ananya Reddy', description: 'Team celebration dinner after successful sprint delivery', receipts: 1 },
  { key: '6', title: 'Cab Fare - Airport Pickup', category: 'Travel', amount: 1800, date: '2026-04-04', status: 'Draft', submittedOn: null, approvedBy: null, employee: 'Rahul Sharma', description: 'Airport pickup for client from Chennai', receipts: 1 },
  { key: '7', title: 'Conference Registration - JSConf India', category: 'Training', amount: 12000, date: '2026-03-20', status: 'Reimbursed', submittedOn: '2026-03-21', approvedBy: 'Priya Singh', employee: 'Rahul Sharma', description: 'Registration fee for JSConf India 2026', receipts: 1 },
  { key: '8', title: 'Internet Reimbursement - March', category: 'Utilities', amount: 1500, date: '2026-03-31', status: 'Approved', submittedOn: '2026-04-01', approvedBy: 'Priya Singh', employee: 'Amit Patel', description: 'Monthly internet reimbursement for WFH', receipts: 1 },
  { key: '9', title: 'Laptop Bag Purchase', category: 'Office Supplies', amount: 3200, date: '2026-04-06', status: 'Submitted', submittedOn: '2026-04-06', approvedBy: null, employee: 'Vikram Joshi', description: 'Laptop bag for new Dell laptop', receipts: 1 },
  { key: '10', title: 'Client Gift - Diwali Hamper', category: 'Meals & Entertainment', amount: 4500, date: '2026-03-10', status: 'Rejected', submittedOn: '2026-03-11', approvedBy: 'Priya Singh', employee: 'Sneha Gupta', description: 'Diwali gift hamper for key client stakeholders', receipts: 2 },
  { key: '11', title: 'Parking Charges - Office', category: 'Travel', amount: 500, date: '2026-04-07', status: 'Draft', submittedOn: null, approvedBy: null, employee: 'Amit Patel', description: 'Monthly parking charges at office building', receipts: 0 },
  { key: '12', title: 'Books - System Design Interview', category: 'Training', amount: 850, date: '2026-03-25', status: 'Reimbursed', submittedOn: '2026-03-26', approvedBy: 'Ananya Reddy', employee: 'Rahul Sharma', description: 'Technical book purchase for upskilling', receipts: 1 },
];

const statusColors: Record<string, string> = {
  Draft: 'default',
  Submitted: 'blue',
  'Under Review': 'orange',
  Approved: 'green',
  Rejected: 'red',
  Reimbursed: 'cyan',
};

const categoryColors: Record<string, string> = {
  'Meals & Entertainment': 'orange',
  Travel: 'blue',
  'Office Supplies': 'green',
  Training: 'purple',
  Utilities: 'cyan',
};

const ExpenseList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [form] = Form.useForm();

  const totalClaims = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => ['Submitted', 'Under Review'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
  const reimbursedAmount = expenses.filter(e => e.status === 'Reimbursed').reduce((sum, e) => sum + e.amount, 0);

  const getFilteredExpenses = () => {
    let filtered = expenses;
    if (activeTab === 'my') filtered = filtered.filter(e => e.employee === 'Rahul Sharma');
    if (activeTab === 'pending') filtered = filtered.filter(e => ['Submitted', 'Under Review'].includes(e.status));
    if (searchText) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchText.toLowerCase()) ||
        e.category.toLowerCase().includes(searchText.toLowerCase()) ||
        e.employee.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredExpenses = getFilteredExpenses();

  const getActionItems = (record: Expense) => {
    const items: any[] = [{ key: 'view', icon: <Eye size={16} />, label: 'View Details' }];
    if (record.status === 'Draft') {
      items.push({ key: 'edit', icon: <Edit2 size={16} />, label: 'Edit' });
      items.push({ key: 'submit', icon: <Send size={16} />, label: 'Submit' });
    }
    if (['Submitted', 'Under Review'].includes(record.status) && activeTab === 'pending') {
      items.push({ key: 'approve', icon: <CheckCircle2 size={16} />, label: 'Approve' });
      items.push({ key: 'reject', icon: <XCircle size={16} />, label: 'Reject', danger: true });
    }
    return items;
  };

  const columns = [
    {
      title: 'Expense', dataIndex: 'title', key: 'title',
      render: (text: string, record: Expense) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>,
    },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount',
      render: (amount: number) => <Text strong style={{ color: '#1a56db' }}>{`\u20B9${amount.toLocaleString('en-IN')}`}</Text>,
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Employee', dataIndex: 'employee', key: 'employee',
      render: (emp: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{emp[0]}</Avatar>
          <Text>{emp}</Text>
        </Space>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
      filters: Object.keys(statusColors).map(s => ({ text: s, value: s })),
      onFilter: (value: any, record: Expense) => record.status === value,
    },
    {
      title: 'Submitted', dataIndex: 'submittedOn', key: 'submittedOn',
      render: (date: string | null) => date ? <Text type="secondary">{date}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Approved By', dataIndex: 'approvedBy', key: 'approvedBy',
      render: (name: string | null) => name ? <Text>{name}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Expense) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Expense Management</Title>
          <Text type="secondary">Track and manage employee expense claims</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerOpen(true)}>
          New Expense Claim
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Claims', value: totalClaims, icon: <Receipt size={20} />, color: '#1a56db', prefix: '\u20B9' },
          { title: 'Pending Approval', value: pendingAmount, icon: <Clock size={20} />, color: '#d97706', prefix: '\u20B9' },
          { title: 'Approved', value: approvedAmount, icon: <CheckCircle2 size={20} />, color: '#059669', prefix: '\u20B9' },
          { title: 'Reimbursed', value: reimbursedAmount, icon: <TrendingUp size={20} />, color: '#7c3aed', prefix: '\u20B9' },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary">{stat.title}</Text>}
                  value={stat.value}
                  prefix={stat.prefix}
                  valueStyle={{ fontSize: 28, fontWeight: 700 }}
                  formatter={(val) => Number(val).toLocaleString('en-IN')}
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'my', label: 'My Expenses' },
            { key: 'pending', label: 'Pending Approvals' },
            { key: 'all', label: 'All Expenses' },
          ]}
        />

        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Search expenses..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button icon={<SlidersHorizontal size={16} />}>Filters</Button>
          </Space>
        </Space>

        <Table
          dataSource={filteredExpenses}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} expenses` }}
        />
      </Card>

      <Drawer
        title="New Expense Claim"
        open={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); form.resetFields(); }}
        width={560}
        extra={
          <Space>
            <Button onClick={() => { setIsDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button onClick={() => { form.validateFields().then(() => { setIsDrawerOpen(false); form.resetFields(); }); }}>
              Save as Draft
            </Button>
            <Button type="primary" icon={<Send size={14} />} onClick={() => { form.validateFields().then(() => { setIsDrawerOpen(false); form.resetFields(); }); }}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Expense Title" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="e.g., Client meeting lunch at Taj" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={[
                  { value: 'Meals & Entertainment', label: 'Meals & Entertainment' },
                  { value: 'Travel', label: 'Travel' },
                  { value: 'Office Supplies', label: 'Office Supplies' },
                  { value: 'Training', label: 'Training' },
                  { value: 'Utilities', label: 'Utilities' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="amount" label="Amount (INR)" rules={[{ required: true, message: 'Enter amount' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  prefix={<IndianRupee size={14} />}
                  placeholder="0.00"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="date" label="Expense Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe the expense purpose and details" />
          </Form.Item>
          <Form.Item name="receipts" label="Receipts">
            <Upload.Dragger maxCount={5} beforeUpload={() => false} multiple>
              <p style={{ marginBottom: 4 }}><Paperclip size={24} style={{ color: '#1a56db' }} /></p>
              <p><Text strong>Upload receipts</Text></p>
              <p><Text type="secondary" style={{ fontSize: 12 }}>Drag or click to upload (PDF, JPG, PNG - Max 5 files)</Text></p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ExpenseList;
