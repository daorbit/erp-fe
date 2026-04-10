import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Drawer, Form, Dropdown, Typography, Space } from 'antd';
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useEmployeeList, useCreateEmployee } from '@/hooks/queries/useEmployees';
import { App } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

interface UserRecord {
  key: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
}

const users: UserRecord[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', phone: '+91 9876543210', role: 'employee', department: 'Engineering', status: 'active', joinDate: '2024-01-15' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', phone: '+91 9876543211', role: 'manager', department: 'Marketing', status: 'active', joinDate: '2023-06-20' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', phone: '+91 9876543212', role: 'employee', department: 'Finance', status: 'inactive', joinDate: '2024-03-10' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', phone: '+91 9876543213', role: 'hr_manager', department: 'HR', status: 'active', joinDate: '2022-11-05' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', phone: '+91 9876543214', role: 'employee', department: 'Sales', status: 'active', joinDate: '2024-02-28' },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', phone: '+91 9876543215', role: 'manager', department: 'Engineering', status: 'active', joinDate: '2023-09-12' },
];

const roleColor: Record<string, string> = { hr_manager: 'purple', manager: 'blue', employee: 'default', admin: 'red', super_admin: 'volcano' };

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { data: employeeData } = useEmployeeList();
  const createMutation = useCreateEmployee();
  const allUsers: UserRecord[] = employeeData?.data ?? users;
  const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()) || u.email.toLowerCase().includes(searchText.toLowerCase()));

  const columns = [
    {
      title: t('employee'), dataIndex: 'name', key: 'name',
      render: (_: any, r: UserRecord) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">{r.name.split(' ').map(n => n[0]).join('')}</Avatar>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-gray-400">{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: t('phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('role'), dataIndex: 'role', key: 'role', render: (role: string) => <Tag color={roleColor[role]}>{role}</Tag> },
    { title: t('department'), dataIndex: 'department', key: 'department', render: (d: string) => <Tag>{d}</Tag> },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Active' ? 'green' : 'red'}>{s}</Tag> },
    { title: t('join_date'), dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: t('actions'), key: 'actions',
      render: () => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={16} />, label: t('edit') },
          { key: 'delete', icon: <Trash2 size={16} />, label: t('delete'), danger: true, onClick: () => message.success('User deleted (mock)') },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('user_management')}</Title>
          <Text type="secondary">{t('manage_employees')}</Text>
        </div>
        <Space>
          <Button icon={<Download size={16} />}>{t('export')}</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>{t('add_employee')}</Button>
        </Space>
      </div>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
          <Button icon={<SlidersHorizontal size={16} />}>Filters</Button>
        </div>
        <Table columns={columns} dataSource={filteredUsers} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title={t('add_employee')} open={isModalOpen} onClose={() => setIsModalOpen(false)} width={520} destroyOnClose extra={<Space><Button onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button><Button type="primary" onClick={() => form.submit()}>{t('add_employee')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={(values) => { message.success('Employee added'); setIsModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="Enter full name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Enter email" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="Enter phone" />
            </Form.Item>
            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
              <Select placeholder="Select department" options={['Engineering', 'Marketing', 'Finance', 'HR', 'Sales'].map(d => ({ value: d, label: d }))} />
            </Form.Item>
          </div>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role" options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Manager', label: 'Manager' },
              { value: 'HR Admin', label: 'HR Admin' },
            ]} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default UserManagement;
