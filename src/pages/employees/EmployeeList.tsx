/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Form,
  Select, Row, Col, Dropdown, Badge, Statistic, Drawer, Tabs, DatePicker,
  Popconfirm, message,
} from 'antd';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  Users,
  UserCheck,
  UserMinus,
  UserPlus,
  Eye,
  SlidersHorizontal,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const mockEmployees = [
  { key: '1', employeeId: 'EMP001', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@company.com', phone: '+91 9876543210', department: 'Engineering', designation: 'Senior Developer', joinDate: '2023-01-15', status: 'Active', employmentType: 'Full-time', reportingManager: 'Ananya Reddy' },
  { key: '2', employeeId: 'EMP002', firstName: 'Priya', lastName: 'Singh', email: 'priya.singh@company.com', phone: '+91 9876543211', department: 'Marketing', designation: 'Marketing Executive', joinDate: '2023-06-20', status: 'Active', employmentType: 'Full-time', reportingManager: 'Meera Nair' },
  { key: '3', employeeId: 'EMP003', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@company.com', phone: '+91 9876543212', department: 'Finance', designation: 'Financial Analyst', joinDate: '2024-03-10', status: 'On Leave', employmentType: 'Full-time', reportingManager: 'Suresh Iyer' },
  { key: '4', employeeId: 'EMP004', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@company.com', phone: '+91 9876543213', department: 'HR', designation: 'HR Manager', joinDate: '2022-11-05', status: 'Active', employmentType: 'Full-time', reportingManager: 'Deepak Verma' },
  { key: '5', employeeId: 'EMP005', firstName: 'Vikram', lastName: 'Joshi', email: 'vikram.joshi@company.com', phone: '+91 9876543214', department: 'Sales', designation: 'Sales Lead', joinDate: '2024-02-28', status: 'Active', employmentType: 'Full-time', reportingManager: 'Meera Nair' },
  { key: '6', employeeId: 'EMP006', firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@company.com', phone: '+91 9876543215', department: 'Engineering', designation: 'Engineering Manager', joinDate: '2022-09-12', status: 'Active', employmentType: 'Full-time', reportingManager: 'Deepak Verma' },
  { key: '7', employeeId: 'EMP007', firstName: 'Karthik', lastName: 'Nair', email: 'karthik.nair@company.com', phone: '+91 9876543216', department: 'Engineering', designation: 'Software Engineer', joinDate: '2024-06-01', status: 'Active', employmentType: 'Full-time', reportingManager: 'Rahul Sharma' },
  { key: '8', employeeId: 'EMP008', firstName: 'Meera', lastName: 'Nair', email: 'meera.nair@company.com', phone: '+91 9876543217', department: 'Marketing', designation: 'Marketing Manager', joinDate: '2022-04-18', status: 'Active', employmentType: 'Full-time', reportingManager: 'Deepak Verma' },
  { key: '9', employeeId: 'EMP009', firstName: 'Suresh', lastName: 'Iyer', email: 'suresh.iyer@company.com', phone: '+91 9876543218', department: 'Finance', designation: 'Finance Manager', joinDate: '2021-08-22', status: 'Active', employmentType: 'Full-time', reportingManager: 'Deepak Verma' },
  { key: '10', employeeId: 'EMP010', firstName: 'Pooja', lastName: 'Deshmukh', email: 'pooja.deshmukh@company.com', phone: '+91 9876543219', department: 'IT', designation: 'System Administrator', joinDate: '2024-01-08', status: 'Active', employmentType: 'Contract', reportingManager: 'Ananya Reddy' },
  { key: '11', employeeId: 'EMP011', firstName: 'Arjun', lastName: 'Menon', email: 'arjun.menon@company.com', phone: '+91 9876543220', department: 'Engineering', designation: 'Team Lead', joinDate: '2023-03-15', status: 'Inactive', employmentType: 'Full-time', reportingManager: 'Ananya Reddy' },
  { key: '12', employeeId: 'EMP012', firstName: 'Divya', lastName: 'Krishnan', email: 'divya.krishnan@company.com', phone: '+91 9876543221', department: 'HR', designation: 'HR Executive', joinDate: '2024-07-20', status: 'Active', employmentType: 'Intern', reportingManager: 'Sneha Gupta' },
  { key: '13', employeeId: 'EMP013', firstName: 'Deepak', lastName: 'Verma', email: 'deepak.verma@company.com', phone: '+91 9876543222', department: 'Operations', designation: 'VP Operations', joinDate: '2020-05-10', status: 'Active', employmentType: 'Full-time', reportingManager: '' },
  { key: '14', employeeId: 'EMP014', firstName: 'Neha', lastName: 'Bhatt', email: 'neha.bhatt@company.com', phone: '+91 9876543223', department: 'Legal', designation: 'Legal Counsel', joinDate: '2023-11-01', status: 'On Leave', employmentType: 'Part-time', reportingManager: 'Deepak Verma' },
];

const departmentColors: Record<string, string> = {
  Engineering: 'blue',
  Marketing: 'magenta',
  Finance: 'green',
  HR: 'purple',
  Sales: 'orange',
  IT: 'cyan',
  Operations: 'geekblue',
  Legal: 'gold',
};

const EmployeeList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const filteredEmployees = mockEmployees.filter(emp => {
    const matchesSearch = !searchText ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchText.toLowerCase());
    const matchesDept = !filterDepartment || emp.department === filterDepartment;
    const matchesStatus = !filterStatus || emp.status === filterStatus;
    const matchesType = !filterType || emp.employmentType === filterType;
    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const stats = [
    { title: 'Total Employees', value: mockEmployees.length, icon: <Users size={20} />, color: '#1a56db' },
    { title: 'Active', value: mockEmployees.filter(e => e.status === 'Active').length, icon: <UserCheck size={20} />, color: '#059669' },
    { title: 'On Leave', value: mockEmployees.filter(e => e.status === 'On Leave').length, icon: <UserMinus size={20} />, color: '#d97706' },
    { title: 'New Joiners (This Month)', value: 2, icon: <UserPlus size={20} />, color: '#7c3aed' },
  ];

  const columns = [
    {
      title: 'Employee', dataIndex: 'firstName', key: 'employee',
      render: (_: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{record.firstName[0]}</Avatar>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text><br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text><br />
            <Text type="secondary" style={{ fontSize: 11 }}>{record.employeeId}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Department', dataIndex: 'department', key: 'department',
      render: (dept: string) => <Tag color={departmentColors[dept] || 'default'}>{dept}</Tag>,
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          Active: 'success', 'On Leave': 'warning', Inactive: 'error', Terminated: 'default',
        };
        return <Badge status={statusMap[status] || 'default'} text={status} />;
      },
    },
    {
      title: 'Type', dataIndex: 'employmentType', key: 'employmentType',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'Full-time': 'blue', 'Part-time': 'cyan', Contract: 'orange', Intern: 'purple',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, record: any) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={16} />, label: 'View Profile', onClick: () => navigate(`/employees/${record.key}`) },
          { key: 'edit', icon: <Edit2 size={16} />, label: 'Edit' },
          { type: 'divider' as const },
          { key: 'delete', icon: <Trash2 size={16} />, label: 'Delete', danger: true, onClick: () => message.success('Employee deleted (mock)') },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  const handleDrawerSubmit = () => {
    form.validateFields().then(() => {
      message.success('Employee added successfully (mock)');
      setDrawerOpen(false);
      form.resetFields();
    });
  };

  const tabItems = [
    {
      key: 'personal',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <User size={14} /> Personal Info
        </span>
      ),
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input prefix={<User size={16} />} placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<Mail size={16} />} placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input prefix={<Phone size={16} />} placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Date of Birth">
                <DatePicker style={{ width: '100%' }} placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select gender" options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maritalStatus" label="Marital Status">
                <Select placeholder="Select status" options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bloodGroup" label="Blood Group">
                <Select placeholder="Select blood group" options={[
                  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} prefix={<MapPin size={16} />} placeholder="Enter address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pincode" label="PIN Code">
                <Input placeholder="PIN Code" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'employment',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} /> Employment
        </span>
      ),
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
                <Input placeholder="e.g. EMP015" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="joinDate" label="Join Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} placeholder="Select date" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select placeholder="Select department" options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'IT', label: 'IT' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Legal', label: 'Legal' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
                <Select placeholder="Select designation" options={[
                  { value: 'Software Engineer', label: 'Software Engineer' },
                  { value: 'Senior Developer', label: 'Senior Developer' },
                  { value: 'Team Lead', label: 'Team Lead' },
                  { value: 'Engineering Manager', label: 'Engineering Manager' },
                  { value: 'Marketing Executive', label: 'Marketing Executive' },
                  { value: 'Financial Analyst', label: 'Financial Analyst' },
                  { value: 'HR Executive', label: 'HR Executive' },
                  { value: 'Sales Lead', label: 'Sales Lead' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Intern', label: 'Intern' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reportingManager" label="Reporting Manager">
                <Select placeholder="Select manager" options={[
                  { value: 'Ananya Reddy', label: 'Ananya Reddy' },
                  { value: 'Deepak Verma', label: 'Deepak Verma' },
                  { value: 'Sneha Gupta', label: 'Sneha Gupta' },
                  { value: 'Meera Nair', label: 'Meera Nair' },
                  { value: 'Suresh Iyer', label: 'Suresh Iyer' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workShift" label="Work Shift">
                <Select placeholder="Select shift" options={[
                  { value: 'General', label: 'General (9 AM - 6 PM)' },
                  { value: 'Morning', label: 'Morning (6 AM - 2 PM)' },
                  { value: 'Evening', label: 'Evening (2 PM - 10 PM)' },
                  { value: 'Night', label: 'Night (10 PM - 6 AM)' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="Active">
                <Select options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'bank',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={14} /> Bank Details
        </span>
      ),
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input prefix={<Building2 size={16} />} placeholder="Enter bank name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankAccountNo" label="Account Number">
                <Input prefix={<CreditCard size={16} />} placeholder="Enter account number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ifscCode" label="IFSC Code">
                <Input placeholder="Enter IFSC code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="panNumber" label="PAN Number">
                <Input placeholder="Enter PAN number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="aadharNumber" label="Aadhaar Number">
            <Input placeholder="Enter Aadhaar number" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
            Emergency Contact
          </Text>
          <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 8, paddingTop: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="emergencyContactName" label="Name">
                  <Input placeholder="Contact name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="emergencyContactPhone" label="Phone">
                  <Input placeholder="Contact phone" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="emergencyContactRelation" label="Relation">
                  <Select placeholder="Relation" options={[
                    { value: 'Spouse', label: 'Spouse' },
                    { value: 'Parent', label: 'Parent' },
                    { value: 'Sibling', label: 'Sibling' },
                    { value: 'Friend', label: 'Friend' },
                    { value: 'Other', label: 'Other' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Employee Directory</Title>
          <Text type="secondary">Manage and view all employee information</Text>
        </div>
        <Space>
          <Button icon={<Upload size={16} />}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>
            Add Employee
          </Button>
        </Space>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
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
              <Text style={{ color: stat.color, fontSize: 12 }}>
                <ArrowUpRight size={12} /> Updated today
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Employee Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Input
              placeholder="Search employees..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 260 }}
            />
            <Select
              placeholder="Department"
              allowClear
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: 150 }}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Finance', label: 'Finance' },
                { value: 'HR', label: 'HR' },
                { value: 'Sales', label: 'Sales' },
                { value: 'IT', label: 'IT' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Legal', label: 'Legal' },
              ]}
            />
            <Select
              placeholder="Status"
              allowClear
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 130 }}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'On Leave', label: 'On Leave' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
            <Select
              placeholder="Type"
              allowClear
              value={filterType}
              onChange={setFilterType}
              style={{ width: 130 }}
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Intern', label: 'Intern' },
              ]}
            />
          </Space>
          <Button icon={<SlidersHorizontal size={16} />}>More Filters</Button>
        </Space>
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} employees`,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Add Employee Drawer */}
      <Drawer
        title="Add New Employee"
        width={720}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        extra={
          <Space>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={handleDrawerSubmit}>Submit</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs items={tabItems} />
        </Form>
      </Drawer>
    </div>
  );
};

export default EmployeeList;
