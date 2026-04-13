import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Drawer, Form, Tabs, Dropdown, Typography, Row, Col, Statistic, Space, Popconfirm, DatePicker, App, Modal } from 'antd';
import {
  Plus, Download, Edit2, Trash2, MoreVertical, Search, Users, UserCheck, UserMinus, UserPlus, Eye,
  Mail, ChevronDown, Copy, Link2,
} from 'lucide-react';
import { useEmployeeList, useCreateEmployee, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useCreateInvitation } from '@/hooks/queries/useInvitations';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { exportToCsv } from '@/lib/exportCsv';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { active: 'green', inactive: 'red', on_leave: 'orange', probation: 'blue', terminated: 'red' };
const typeColor: Record<string, string> = { full_time: 'blue', part_time: 'cyan', contract: 'purple', intern: 'gold' };

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [deptFilter, setDeptFilter] = useState<string | undefined>();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [inviteForm] = Form.useForm();
  const createInviteMutation = useCreateInvitation();

  const params: any = {};
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (deptFilter) params.department = deptFilter;

  const { data: empData, isLoading } = useEmployeeList(params);
  const { data: deptData } = useDepartmentList();
  const createMutation = useCreateEmployee();
  const deleteMutation = useDeleteEmployee();

  const { data: desigData } = useDesignationList();
  const employees: any[] = empData?.data ?? [];
  const departments: any[] = deptData?.data ?? [];
  const designations: any[] = desigData?.data ?? [];

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

  const handleCreate = async (values: any) => {
    try {
      const payload: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.format?.('YYYY-MM-DD') ?? values.dateOfBirth,
        department: values.department,
        designation: values.designation,
        employmentType: values.employmentType,
        joinDate: values.joinDate?.format?.('YYYY-MM-DD') ?? values.joinDate,
        reportingManager: values.reportingManager,
      };
      if (values.bankName || values.accountNumber || values.ifscCode) {
        payload.bankDetails = {
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          ifscCode: values.ifscCode,
        };
      }
      if (values.panNumber) {
        payload.identityDocs = {
          panNumber: values.panNumber,
        };
      }
      // Remove undefined values
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await createMutation.mutateAsync(payload);
      message.success('Employee created successfully');
      form.resetFields();
      setDrawerOpen(false);
    } catch (err: any) {
      message.error(err?.message || 'Failed to create employee');
    }
  };

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
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>{t('add_employee')}</Button>
          <Button icon={<Mail size={16} />} onClick={() => { inviteForm.resetFields(); setInviteDrawerOpen(true); }}>Invite User</Button>
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

      <Drawer title={t('add_employee')} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Tabs items={[
            { key: 'personal', label: 'Personal Info', children: (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item>
                </div>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
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
                  <Form.Item name="designation" label="Designation">
                    <Select placeholder="Select designation" allowClear showSearch optionFilterProp="label" options={designations.map((d: any) => ({ value: d._id || d.id, label: d.title }))} />
                  </Form.Item>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="employmentType" label="Employment Type">
                    <Select options={['full_time', 'part_time', 'contract', 'intern'].map(t => ({ value: t, label: t }))} />
                  </Form.Item>
                  <Form.Item name="joinDate" label="Join Date"><DatePicker className="w-full" /></Form.Item>
                </div>
                <Form.Item name="reportingManager" label="Reporting Manager">
                  <Select placeholder="Select manager" allowClear showSearch optionFilterProp="label" options={employees.map((e: any) => ({ value: e._id || e.userId?._id || e.id, label: `${e.userId?.firstName || e.firstName || ''} ${e.userId?.lastName || e.lastName || ''}`.trim() }))} />
                </Form.Item>
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
            <Button onClick={() => setDrawerOpen(false)}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('add_employee')}</Button>
          </div>
        </Form>
      </Drawer>

      {/* Invite User Drawer */}
      <Drawer
        title={<span className="flex items-center gap-2"><Mail size={18} /> Invite User</span>}
        open={inviteDrawerOpen}
        onClose={() => setInviteDrawerOpen(false)}
        width={480}
        destroyOnClose
        extra={<Space><Button onClick={() => setInviteDrawerOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={createInviteMutation.isPending} onClick={() => inviteForm.submit()}>Send Invite</Button></Space>}
      >
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
          A unique invitation link will be generated. Share it with the user — they'll set up their own name and password.
        </div>
        <Form form={inviteForm} layout="vertical" onFinish={async (values: any) => {
          try {
            const result = await createInviteMutation.mutateAsync(values);
            const link = result?.data?.invitationLink;
            inviteForm.resetFields();
            setInviteDrawerOpen(false);
            if (link) setInvitationLink(link);
            else message.success('Invitation created');
          } catch (err: any) {
            message.error(err?.message || 'Failed to create invitation');
          }
        }}>
          <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="user@company.com" />
          </Form.Item>
          <Form.Item name="role" label={t('role')} rules={[{ required: true }]} initialValue="employee">
            <Select placeholder="Select role" options={[
              { value: 'viewer', label: 'Viewer (Read-only)' },
              { value: 'employee', label: 'Employee' },
              { value: 'manager', label: 'Manager' },
              { value: 'hr_manager', label: 'HR Manager' },
              { value: 'admin', label: 'Company Admin' },
            ]} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Invitation Link Modal */}
      <Modal
        title={<span className="flex items-center gap-2"><Link2 size={18} /> Invitation Link Created</span>}
        open={!!invitationLink}
        onCancel={() => setInvitationLink(null)}
        footer={<Button onClick={() => setInvitationLink(null)}>Done</Button>}
        width={560}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">Share this link with the user. It expires in <strong>48 hours</strong>.</p>
          <div className="flex gap-2">
            <Input value={invitationLink || ''} readOnly className="font-mono text-xs" />
            <Button type="primary" icon={<Copy size={14} />} onClick={() => { navigator.clipboard.writeText(invitationLink!); message.success('Link copied'); }}>Copy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeList;
