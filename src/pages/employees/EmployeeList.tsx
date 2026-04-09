import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Drawer, Form, Tabs, Dropdown, Typography, Row, Col, Statistic, Space, Popconfirm, DatePicker, App } from 'antd';
import {
  Plus, Download, Edit2, Trash2, MoreVertical, Search, Users, UserCheck, UserMinus, UserPlus, Eye,
} from 'lucide-react';
import { useEmployeeList, useCreateEmployee, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { active: 'green', inactive: 'red', on_leave: 'orange', probation: 'blue', terminated: 'red' };
const typeColor: Record<string, string> = { full_time: 'blue', part_time: 'cyan', contract: 'purple', intern: 'gold' };

const EmployeeList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [deptFilter, setDeptFilter] = useState<string | undefined>();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const params: any = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (deptFilter) params.department = deptFilter;

  const { data: empData, isLoading } = useEmployeeList(params);
  const { data: deptData } = useDepartmentList();
  const createMutation = useCreateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees: any[] = empData?.data ?? [];
  const departments: any[] = deptData?.data ?? [];

  const totalEmployees = employees.length;
  const activeCount = employees.filter((e: any) => e.status === 'active').length;
  const onLeaveCount = employees.filter((e: any) => e.status === 'on_leave').length;
  const newJoiners = employees.filter((e: any) => {
    if (!e.joinDate) return false;
    const d = new Date(e.joinDate);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    { title: 'Total Employees', value: totalEmployees, icon: <Users size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Active', value: activeCount, icon: <UserCheck size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'On Leave', value: onLeaveCount, icon: <UserMinus size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'New Joiners (30d)', value: newJoiners, icon: <UserPlus size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Employee created successfully');
      form.resetFields();
      setDrawerOpen(false);
    } catch {
      message.error('Failed to create employee');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Employee deleted');
    } catch {
      message.error('Failed to delete employee');
    }
  };

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" src={r.avatar}>{(r.name || r.firstName || '').split(' ').map((n: string) => n[0]).join('')}</Avatar>
          <div>
            <div className="font-medium">{r.name || `${r.firstName ?? ''} ${r.lastName ?? ''}`}</div>
            <div className="text-xs text-gray-400">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Department', dataIndex: 'department', key: 'department',
      filters: departments.map((d: any) => ({ text: d.name, value: d.name })),
      onFilter: (value: any, record: any) => {
        const dept = typeof record.department === 'object' ? record.department?.name : record.department;
        return dept === value;
      },
      render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : d}</Tag>,
    },
    { title: 'Designation', dataIndex: 'designation', key: 'designation', render: (d: any) => typeof d === 'object' ? d?.title : (d || '-') },
    { title: 'Join Date', dataIndex: 'joinDate', key: 'joinDate', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'On Leave', value: 'on_leave' },
        { text: 'Probation', value: 'probation' },
        { text: 'Terminated', value: 'terminated' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag>,
    },
    {
      title: 'Type', dataIndex: 'employmentType', key: 'employmentType',
      filters: [
        { text: 'Full Time', value: 'full_time' },
        { text: 'Part Time', value: 'part_time' },
        { text: 'Contract', value: 'contract' },
        { text: 'Intern', value: 'intern' },
      ],
      onFilter: (value: any, record: any) => record.employmentType === value,
      render: (t: string) => <Tag color={typeColor[t] || 'default'}>{t || '-'}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={14} />, label: 'View', onClick: () => navigate(`/employees/${r._id || r.id}`) },
          { key: 'edit', icon: <Edit2 size={14} />, label: 'Edit' },
          { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true, onClick: () => handleDelete(r._id || r.id) },
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
          <Title level={4} className="!mb-1">Employees</Title>
          <Text type="secondary">View and manage all employees</Text>
        </div>
        <Space>
          <Button icon={<Download size={16} />}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>Add Employee</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="h-full" bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">{s.title}</Text>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input prefix={<Search size={16} />} placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
          <Space>
            <Select placeholder="Department" allowClear className="min-w-[150px]" value={deptFilter} onChange={setDeptFilter}
              options={departments.map((d: any) => ({ value: d._id || d.id || d.name, label: d.name }))} />
            <Select placeholder="Status" allowClear className="min-w-[120px]" value={statusFilter} onChange={setStatusFilter}
              options={['active', 'inactive', 'on_leave', 'probation', 'terminated'].map(s => ({ value: s, label: s }))} />
          </Space>
        </div>
        <Table columns={columns} dataSource={employees} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title="Add Employee" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={600} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Tabs items={[
            { key: 'personal', label: 'Personal Info', children: (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item>
                </div>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="phone" label="Phone"><Input /></Form.Item>
                  <Form.Item name="dateOfBirth" label="Date of Birth"><DatePicker className="w-full" /></Form.Item>
                </div>
                <Form.Item name="gender" label="Gender"><Select options={['male', 'female', 'other'].map(g => ({ value: g, label: g }))} /></Form.Item>
              </>
            )},
            { key: 'employment', label: 'Employment', children: (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                    <Select options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
                  </Form.Item>
                  <Form.Item name="designation" label="Designation"><Input /></Form.Item>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="employmentType" label="Employment Type">
                    <Select options={['full_time', 'part_time', 'contract', 'intern'].map(t => ({ value: t, label: t }))} />
                  </Form.Item>
                  <Form.Item name="joinDate" label="Join Date"><DatePicker className="w-full" /></Form.Item>
                </div>
                <Form.Item name="reportingManager" label="Reporting Manager"><Input /></Form.Item>
              </>
            )},
            { key: 'bank', label: 'Bank Details', children: (
              <>
                <Form.Item name="bankName" label="Bank Name"><Input /></Form.Item>
                <Form.Item name="accountNumber" label="Account Number"><Input /></Form.Item>
                <Form.Item name="ifscCode" label="IFSC Code"><Input /></Form.Item>
                <Form.Item name="panNumber" label="PAN Number"><Input /></Form.Item>
              </>
            )},
          ]} />
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Add Employee</Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default EmployeeList;
