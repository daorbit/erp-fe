import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Descriptions, Typography, Button, Tag, Spin, Divider, Table, App,
} from 'antd';
import { ArrowLeft, Edit2 } from 'lucide-react';
import api from '@/services/api';

const { Title } = Typography;

const txt = (v: any) => (v !== undefined && v !== null && v !== '') ? String(v) : '—';
const yesNo = (v: any) => (v ? <Tag color="green">YES</Tag> : <Tag color="red">NO</Tag>);
const refName = (v: any) => (typeof v === 'object' && v ? v.name || v.title || '—' : txt(v));

const USER_TYPE_LABELS: Record<string, string> = {
  super_admin: 'SUPERADMIN',
  admin: 'ADMIN',
  ho_user: 'HO-USER',
  site_admin: 'SITE-ADMIN',
  user: 'USER',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  hr_manager: 'HR Manager',
  employee: 'Employee',
};

const UserView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await api.get(`/auth/users/${id}`);
        setUser(res?.data ?? res);
      } catch (err: any) {
        message.error(err?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, message]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <Title level={5}>User not found</Title>
        <Button onClick={() => navigate('/master/user/list')}>Back to List</Button>
      </div>
    );
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || '—';

  // Allowed departments / branches columns
  const deptColumns = [
    { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Department Name', render: (_: any, r: any) => refName(r) },
  ];
  const branchColumns = [
    { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Branch Name', render: (_: any, r: any) => refName(r) },
  ];
  const moduleColumns = [
    { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Module', dataIndex: undefined, render: (v: any) => txt(v) },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/master/user/list')} />
          <Title level={4} className="!mb-0">{fullName}</Title>
          <Tag color={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Inactive'}</Tag>
        </div>
        <Button
          type="primary"
          icon={<Edit2 size={14} />}
          onClick={() => navigate(`/master/user/edit/${id}`)}
        >
          Edit
        </Button>
      </div>

      {/* ─── Basic Info ─────────────────────────────────────────────── */}
      <Card bordered={false} title="User Details">
        <Descriptions column={{ xs: 1, sm: 2, xl: 3 }} bordered size="small">
          <Descriptions.Item label="User Name">{txt(user.username)}</Descriptions.Item>
          <Descriptions.Item label="First Name">{txt(user.firstName)}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{txt(user.lastName)}</Descriptions.Item>
          <Descriptions.Item label="Email">{txt(user.email)}</Descriptions.Item>
          <Descriptions.Item label="Phone">{txt(user.phone)}</Descriptions.Item>
          <Descriptions.Item label="Employee ID">{txt(user.employeeId)}</Descriptions.Item>
          <Descriptions.Item label="Role">{ROLE_LABELS[user.role] ?? txt(user.role)}</Descriptions.Item>
          <Descriptions.Item label="User Type">{USER_TYPE_LABELS[user.userType] ?? txt(user.userType)}</Descriptions.Item>
          <Descriptions.Item label="User Category">{txt(user.userCategory)}</Descriptions.Item>
          <Descriptions.Item label="Company">{refName(user.company)}</Descriptions.Item>
          <Descriptions.Item label="Department">{refName(user.department)}</Descriptions.Item>
          <Descriptions.Item label="Designation">{refName(user.designation)}</Descriptions.Item>
          <Descriptions.Item label="Is Active">{yesNo(user.isActive)}</Descriptions.Item>
          <Descriptions.Item label="Onboarding Required">{yesNo(user.onboardingRequired)}</Descriptions.Item>
          <Descriptions.Item label="Onboarding Completed">{yesNo(user.onboardingCompleted)}</Descriptions.Item>
          <Descriptions.Item label="ERP Dev Company User">{yesNo(user.isErpDevCoUser)}</Descriptions.Item>
          <Descriptions.Item label="Last Login">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : '—'}
          </Descriptions.Item>
          {user.remark && (
            <Descriptions.Item label="Remark" span={3}>{txt(user.remark)}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* ─── Allowed Departments ────────────────────────────────────── */}
      {Array.isArray(user.allowedDepartments) && user.allowedDepartments.length > 0 && (
        <Card bordered={false} title="Allowed Departments">
          <Table
            columns={deptColumns as any}
            dataSource={user.allowedDepartments}
            rowKey={(_: any, i: number) => String(i)}
            size="small"
            bordered
            pagination={false}
          />
        </Card>
      )}

      {/* ─── Allowed Branches ───────────────────────────────────────── */}
      {Array.isArray(user.allowedBranches) && user.allowedBranches.length > 0 && (
        <Card bordered={false} title="Allowed Branches">
          <Table
            columns={branchColumns as any}
            dataSource={user.allowedBranches}
            rowKey={(_: any, i: number) => String(i)}
            size="small"
            bordered
            pagination={false}
          />
        </Card>
      )}

      {/* ─── Allowed Modules ────────────────────────────────────────── */}
      {Array.isArray(user.allowedModules) && user.allowedModules.length > 0 && (
        <Card bordered={false} title="Allowed Modules">
          <Table
            columns={moduleColumns as any}
            dataSource={user.allowedModules.map((m: string) => m)}
            rowKey={(_: any, i: number) => String(i)}
            size="small"
            bordered
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default UserView;
