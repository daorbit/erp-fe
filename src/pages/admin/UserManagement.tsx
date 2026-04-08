import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Modal, Form,
  Select, Row, Col, Dropdown, Badge, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, FilterOutlined, ExportOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const users = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', phone: '+91 9876543210', role: 'Employee', department: 'Engineering', status: 'Active', joinDate: '2024-01-15' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', phone: '+91 9876543211', role: 'Manager', department: 'Marketing', status: 'Active', joinDate: '2023-06-20' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', phone: '+91 9876543212', role: 'Employee', department: 'Finance', status: 'Inactive', joinDate: '2024-03-10' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', phone: '+91 9876543213', role: 'HR Admin', department: 'HR', status: 'Active', joinDate: '2022-11-05' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', phone: '+91 9876543214', role: 'Employee', department: 'Sales', status: 'Active', joinDate: '2024-02-28' },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', phone: '+91 9876543215', role: 'Manager', department: 'Engineering', status: 'Active', joinDate: '2023-09-12' },
];

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text><br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Role', dataIndex: 'role', key: 'role',
      render: (role: string) => {
        const color = role === 'HR Admin' ? 'purple' : role === 'Manager' ? 'blue' : 'default';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag>{d}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Badge status={status === 'Active' ? 'success' : 'error'} text={status} />,
    },
    { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: 'Actions', key: 'actions',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>User Management</Title>
          <Text type="secondary">Manage all employees and their access</Text>
        </div>
        <Space>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Employee
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search employees..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<FilterOutlined />}>Filters</Button>
        </Space>
        <Table dataSource={filteredUsers} columns={columns} pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} employees` }} />
      </Card>

      <Modal
        title="Add New Employee"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => { form.validateFields().then(() => setIsModalOpen(false)); }}
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select placeholder="Select department" options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Sales', label: 'Sales' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select placeholder="Select role" options={[
                  { value: 'Employee', label: 'Employee' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'HR Admin', label: 'HR Admin' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
