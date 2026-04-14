import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Typography, Row, Col, Space, Dropdown, App } from 'antd';
import {
  Plus, Download, Edit2, Trash2, MoreVertical, Search, Users, UserCheck, UserMinus, UserPlus, Eye,
  Mail,
} from 'lucide-react';
import { useEmployeeList, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { exportToCsv } from '@/lib/exportCsv';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { active: 'green', inactive: 'red', on_leave: 'orange', probation: 'blue', terminated: 'red' };
const typeColor: Record<string, string> = { full_time: 'blue', part_time: 'cyan', contract: 'purple', intern: 'gold' };

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [deptFilter, setDeptFilter] = useState<string | undefined>();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const params: any = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (deptFilter) params.department = deptFilter;

  const { data: empData, isLoading } = useEmployeeList(params);
  const { data: deptData } = useDepartmentList();
  const deleteMutation = useDeleteEmployee();

  const employees: any[] = empData?.data ?? [];
  const departments: any[] = deptData?.data ?? [];

  const totalEmployees = employees.length;
  const activeCount = employees.filter((e: any) => e.isActive).length;
  const onLeaveCount = employees.filter((e: any) => e.status === 'on_leave').length;
  const newJoiners = employees.filter((e: any) => {
    if (!e.joinDate) return false;
    const d = new Date(e.joinDate);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    { title: t('total_employees'), value: totalEmployees, icon: <Users size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: t('active'), value: activeCount, icon: <UserCheck size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('on_leave'), value: onLeaveCount, icon: <UserMinus size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: t('new_joiners'), value: newJoiners, icon: <UserPlus size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Employee deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete employee');
    }
  };

  // Extract user data from populated userId field
  const getUser = (r: any) => r.userId || {};
  const getName = (r: any) => {
    const u = getUser(r);
    return `${u.firstName || r.firstName || ''} ${u.lastName || r.lastName || ''}`.trim() || 'N/A';
  };
  const getEmail = (r: any) => getUser(r).email || r.email || '';
  const getDept = (r: any) => {
    const d = getUser(r).department;
    return typeof d === 'object' ? d?.name : d;
  };
  const getDesig = (r: any) => {
    const d = getUser(r).designation;
    return typeof d === 'object' ? d?.title : d;
  };

  const columns = [
    {
      title: t('employee'), key: 'name',
      render: (_: any, r: any) => {
        const name = getName(r);
        const email = getEmail(r);
        const avatar = getUser(r).avatar;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600" src={avatar}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-gray-400">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Employee ID', dataIndex: 'employeeId', key: 'employeeId',
      render: (id: string) => <span className="text-xs font-mono text-gray-500">{id || '-'}</span>,
    },
    {
      title: t('department'), key: 'department',
      filters: departments.map((d: any) => ({ text: d.name, value: d.name })),
      onFilter: (value: any, record: any) => getDept(record) === value,
      render: (_: any, r: any) => {
        const dept = getDept(r);
        return dept ? <Tag color="blue">{dept}</Tag> : <span className="text-gray-400">-</span>;
      },
    },
    {
      title: t('designation'), key: 'designation',
      render: (_: any, r: any) => {
        const desig = getDesig(r);
        return desig ? <span className="text-sm">{desig}</span> : <span className="text-gray-400">-</span>;
      },
    },
    {
      title: t('join_date'), dataIndex: 'joinDate', key: 'joinDate',
      render: (d: string) => d ? <span className="text-sm">{new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span> : <span className="text-gray-400">-</span>,
    },
    {
      title: t('status'), dataIndex: 'isActive', key: 'status',
      filters: [{ text: 'Active', value: true }, { text: 'Inactive', value: false }],
      onFilter: (value: any, record: any) => record.isActive === value,
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: t('type'), dataIndex: 'employmentType', key: 'employmentType',
      filters: [
        { text: 'Full Time', value: 'full_time' },
        { text: 'Part Time', value: 'part_time' },
        { text: 'Contract', value: 'contract' },
        { text: 'Intern', value: 'intern' },
      ],
      onFilter: (value: any, record: any) => record.employmentType === value,
      render: (t: string) => t ? <Tag color={typeColor[t] || 'default'}>{t.replace('_', ' ')}</Tag> : <span className="text-gray-400">-</span>,
    },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={14} />, label: t('view'), onClick: () => navigate(`/employees/${r._id || r.id}`) },
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => navigate(`/employees/${r._id || r.id}?edit=true`) },
          { key: 'delete', icon: <Trash2 size={14} />, label: t('delete'), danger: true, onClick: () => handleDelete(r._id || r.id) },
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
          <Title level={4} className="!mb-1">{t('employees')}</Title>
          <Text type="secondary">{t('manage_employees')}</Text>
        </div>
        <Space>
          <Button icon={<Download size={16} />} onClick={() => exportToCsv(employees, [
            { key: 'name', title: 'Name', render: (_: any, r: any) => `${r.userId?.firstName || ''} ${r.userId?.lastName || ''}`.trim() },
            { key: 'email', title: 'Email', render: (_: any, r: any) => r.userId?.email || '' },
            { key: 'employeeId', title: 'Employee ID' },
            { key: 'department', title: 'Department', render: (_: any, r: any) => { const d = r.userId?.department; return typeof d === 'object' ? d?.name : (d || ''); } },
            { key: 'designation', title: 'Designation', render: (_: any, r: any) => { const d = r.userId?.designation; return typeof d === 'object' ? d?.title : (d || ''); } },
            { key: 'employmentType', title: 'Type', render: (v: string) => v?.replace('_', ' ') || '' },
            { key: 'joinDate', title: 'Join Date' },
            { key: 'isActive', title: 'Status', render: (v: boolean) => v ? 'Active' : 'Inactive' },
          ], 'employees')}>{t('export')}</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/employees/create')}>{t('add_employee')}</Button>
          <Button icon={<Mail size={16} />} onClick={() => navigate('/employees/invite')}>Invite User</Button>
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
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
          <Space>
            <Select placeholder="Department" allowClear className="min-w-[150px]" value={deptFilter} onChange={setDeptFilter}
              options={departments.map((d: any) => ({ value: d._id || d.id || d.name, label: d.name }))} />
            <Select placeholder="Status" allowClear className="min-w-[120px]" value={statusFilter} onChange={setStatusFilter}
              options={['active', 'inactive', 'on_leave', 'probation', 'terminated'].map(s => ({ value: s, label: s }))} />
          </Space>
        </div>
        <Table columns={columns} dataSource={employees} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default EmployeeList;
