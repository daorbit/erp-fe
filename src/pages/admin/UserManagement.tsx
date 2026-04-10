import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Drawer, Form, Dropdown, Typography, Space, App } from 'antd';
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService from '@/services/companyService';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';
import { useTranslation } from '@/hooks/useTranslation';
import authService from '@/services/authService';
import api from '@/services/api';

const { Title, Text } = Typography;

const roleColor: Record<string, string> = {
  super_admin: 'volcano',
  admin: 'red',
  hr_manager: 'purple',
  manager: 'blue',
  employee: 'default',
};

const roleLabel: Record<string, string> = {
  super_admin: 'Platform Admin',
  admin: 'Company Admin',
  hr_manager: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
};

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  // Fetch all users (auth users, not employee profiles)
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => api.get<any>('/auth/users'),
  });

  const { data: companyData } = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: () => companyService.getAll(),
    enabled: isSuperAdmin,
  });
  const companies: any[] = companyData?.data ?? [];

  const createUserMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const users: any[] = userData?.data ?? [];
  const filteredUsers = users.filter(
    (u: any) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const q = searchText.toLowerCase();
      return !searchText || name.includes(q) || u.email?.toLowerCase().includes(q);
    },
  );

  const handleCreate = async (values: any) => {
    try {
      await createUserMutation.mutateAsync(values);
      message.success('User created successfully');
      form.resetFields();
      setDrawerOpen(false);
    } catch (err: any) {
      message.error(err?.message || 'Failed to create user');
    }
  };

  const columns = [
    {
      title: t('employee'),
      dataIndex: 'firstName',
      key: 'name',
      render: (_: any, r: any) => {
        const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600">{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-xs text-gray-400">{r.email}</div>
            </div>
          </div>
        );
      },
    },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', render: (p: string) => p || '-' },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      filters: Object.entries(roleLabel).map(([value, text]) => ({ text, value })),
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => <Tag color={roleColor[role] || 'default'}>{roleLabel[role] || role}</Tag>,
    },
    {
      title: t('department'),
      dataIndex: 'department',
      key: 'department',
      render: (d: any) => <Tag>{typeof d === 'object' ? d?.name : (d || '-')}</Tag>,
    },
    ...(isSuperAdmin
      ? [{
          title: t('company'),
          dataIndex: 'company',
          key: 'company',
          render: (c: any) => <Tag>{typeof c === 'object' ? c?.name : (c || '-')}</Tag>,
        }]
      : []),
    {
      title: t('status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? t('active') : t('inactive')}</Tag>,
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <Edit2 size={14} />, label: t('edit') },
              { key: 'delete', icon: <Trash2 size={14} />, label: t('delete'), danger: true },
            ],
          }}
          trigger={['click']}
        >
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
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setDrawerOpen(true); }}>
            {t('add_user')}
          </Button>
        </Space>
      </div>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title={t('add_user')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" loading={createUserMutation.isPending} onClick={() => form.submit()}>
              {t('save')}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
              <Input.Password placeholder="Min 8 characters" />
            </Form.Item>
          </div>
          <Form.Item name="phone" label={t('phone')}>
            <Input placeholder="+91 9999999999" />
          </Form.Item>
          <Form.Item name="role" label={t('role')} rules={[{ required: true }]} initialValue="employee">
            <Select
              placeholder="Select role"
              onChange={() => form.validateFields(['company']).catch(() => {})}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
                { value: 'hr_manager', label: 'HR Manager' },
                { value: 'admin', label: 'Company Admin' },
                ...(isSuperAdmin ? [{ value: 'super_admin', label: 'Platform Admin' }] : []),
              ]}
            />
          </Form.Item>
          {isSuperAdmin && (
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
              {({ getFieldValue }) => {
                const selectedRole = getFieldValue('role');
                const needsCompany = selectedRole !== 'super_admin';
                return needsCompany ? (
                  <Form.Item
                    name="company"
                    label={t('company')}
                    rules={[{ required: true, message: 'Please select a company for this user' }]}
                  >
                    <Select
                      placeholder={companies.length ? 'Select company' : 'No companies — create one first'}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      disabled={companies.length === 0}
                      options={companies.map((c: any) => ({ value: c._id || c.id, label: `${c.name} (${c.code})` }))}
                    />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default UserManagement;
