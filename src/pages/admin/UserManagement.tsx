import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Button, Input, Select, Dropdown, Typography, Space, App, Modal, Tabs, Tooltip, Image } from 'antd';
import {
  Plus, Download, Edit2, Trash2, MoreVertical, Search, Mail, Copy, Link2,
  UserCheck, UserX, Clock, CheckCircle2, ClipboardCheck,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService from '@/services/companyService';
import invitationService from '@/services/invitationService';
import { useCreateInvitation } from '@/hooks/queries/useInvitations';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exportToCsv } from '@/lib/exportCsv';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const roleColor: Record<string, string> = {
  super_admin: 'volcano', admin: 'red', hr_manager: 'purple', manager: 'blue', employee: 'default', viewer: 'cyan',
};
const roleLabel: Record<string, string> = {
  super_admin: 'Platform Admin', admin: 'Company Admin', hr_manager: 'HR Manager', manager: 'Manager', employee: 'Employee', viewer: 'Viewer',
};

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('users');
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string | undefined>(searchParams.get('company') || undefined);
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  // ─── Queries ─────────────────────────────────────────────────────────────
  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => api.get<any>('/auth/users'),
  });
  const { data: companyData } = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: () => companyService.getAll(),
    enabled: isSuperAdmin,
  });
  const { data: inviteData, isLoading: invitesLoading } = useQuery({
    queryKey: ['invitations', 'list'],
    queryFn: () => invitationService.list(),
  });

  const companies: any[] = companyData?.data ?? [];
  const users: any[] = userData?.data ?? [];
  const invitations: any[] = inviteData?.data ?? [];

  // ─── Mutations ───────────────────────────────────────────────────────────
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.patch<any>(`/auth/users/${id}/toggle-status`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
  const toggleOnboardingMutation = useMutation({
    mutationFn: (id: string) => api.patch<any>(`/auth/users/${id}/onboarding`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });

  // Sync company filter with URL params
  const handleCompanyFilterChange = (value: string | undefined) => {
    setCompanyFilter(value);
    if (value) {
      setSearchParams({ company: value });
    } else {
      setSearchParams({});
    }
  };

  // ─── Filters ─────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u: any) => {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const q = searchText.toLowerCase();
    const matchesSearch = !searchText || name.includes(q) || u.email?.toLowerCase().includes(q);
    const companyId = typeof u.company === 'object' ? (u.company?._id || u.company?.id) : u.company;
    const matchesCompany = !companyFilter || companyId === companyFilter;
    return matchesSearch && matchesCompany;
  });

  const filteredInvitations = invitations.filter((inv: any) => {
    const companyId = typeof inv.company === 'object' ? (inv.company?._id || inv.company?.id) : inv.company;
    return !companyFilter || companyId === companyFilter;
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleToggleStatus = async (id: string, currentlyActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      message.success(`User ${currentlyActive ? 'disabled' : 'enabled'} successfully`);
    } catch (err: any) { message.error(err?.message || 'Failed to update user status'); }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    message.success('Link copied to clipboard');
  };

  // ─── User Columns ────────────────────────────────────────────────────────
  const userColumns = [
    {
      title: t('name'), dataIndex: 'firstName', key: 'name',
      render: (_: any, r: any) => {
        const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'N/A';
        return (
          <div className="flex items-center gap-3">
            {r.avatar ? (
              <Image
                src={r.avatar}
                alt={name}
                width={36}
                height={36}
                className="rounded-full object-cover"
                preview={{ mask: 'View' }}
              />
            ) : (
              <Avatar className={r.isActive ? 'bg-blue-600' : 'bg-gray-400'}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            )}
            <div>
              <div className={`font-medium ${!r.isActive ? 'text-gray-400 line-through' : ''}`}>{name}</div>
              <div className="text-xs text-gray-400">{r.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: t('role'), dataIndex: 'role', key: 'role',
      filters: Object.entries(roleLabel).map(([value, text]) => ({ text, value })),
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => <Tag color={roleColor[role] || 'default'}>{roleLabel[role] || role}</Tag>,
    },
    ...(isSuperAdmin ? [{
      title: t('company'), dataIndex: 'company', key: 'company',
      render: (c: any) => <Tag>{typeof c === 'object' ? c?.name : (c || '-')}</Tag>,
    }] : []),
    {
      title: 'Onboarding', dataIndex: 'onboardingRequired', key: 'onboarding',
      render: (_: any, r: any) => {
        if (!r.onboardingRequired) return <Tag>Not required</Tag>;
        return r.onboardingCompleted
          ? <Tag color="green">Completed</Tag>
          : <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: t('status'), dataIndex: 'isActive', key: 'isActive',
      filters: [{ text: t('active'), value: true }, { text: t('inactive'), value: false }],
      onFilter: (value: any, record: any) => record.isActive === value,
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? t('active') : t('inactive')}</Tag>,
    },
    {
      title: t('actions'), key: 'actions', width: 120,
      render: (_: any, r: any) => {
        const isSelf = (r._id || r.id) === currentUser?._id;
        return (
          <Dropdown menu={{ items: [
            {
              key: 'toggle',
              icon: r.isActive ? <UserX size={14} /> : <UserCheck size={14} />,
              label: isSelf ? 'Cannot disable yourself' : (r.isActive ? 'Disable User' : 'Enable User'),
              danger: r.isActive && !isSelf,
              disabled: isSelf,
            },
            ...(r.role !== 'super_admin' ? [{
              key: 'onboarding',
              icon: <ClipboardCheck size={14} />,
              label: r.onboardingRequired ? 'Remove Onboarding' : 'Require Onboarding',
            }] : []),
          ], onClick: ({ key }) => {
            const id = r._id || r.id;
            if (key === 'toggle' && !isSelf) handleToggleStatus(id, r.isActive);
            if (key === 'onboarding') toggleOnboardingMutation.mutate(id);
          }}} trigger={['click']}>
            <Button type="text" icon={<MoreVertical size={16} />} />
          </Dropdown>
        );
      },
    },
  ];

  // ─── Invitation Columns ──────────────────────────────────────────────────
  const invitationColumns = [
    { title: t('email'), dataIndex: 'email', key: 'email', render: (e: string) => <Text className="font-medium">{e}</Text> },
    {
      title: t('role'), dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color={roleColor[role] || 'default'}>{roleLabel[role] || role}</Tag>,
    },
    ...(isSuperAdmin ? [{
      title: t('company'), dataIndex: 'company', key: 'company',
      render: (c: any) => <Tag>{typeof c === 'object' ? c?.name : (c || '-')}</Tag>,
    }] : []),
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const colors: Record<string, string> = { pending: 'processing', accepted: 'success', expired: 'default' };
        return <Tag color={colors[s] || 'default'}>{s}</Tag>;
      },
    },
    {
      title: 'Expires', dataIndex: 'expiresAt', key: 'expiresAt',
      render: (d: string) => d ? dayjs(d).format('MMM D, YYYY h:mm A') : '-',
    },
    {
      title: 'Invited By', dataIndex: 'invitedBy', key: 'invitedBy',
      render: (u: any) => u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '-',
    },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => r.status === 'pending' && r.invitationLink ? (
        <Tooltip title="Copy invitation link">
          <Button type="text" icon={<Copy size={14} />} onClick={() => copyToClipboard(r.invitationLink)} />
        </Tooltip>
      ) : <Text type="secondary" className="text-xs">{r.status === 'accepted' ? 'Used' : '-'}</Text>,
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">
            {t('user_management')}
            {companyFilter && companies.length > 0 && (
              <Tag color="blue" className="ml-2 text-sm font-normal" closable onClose={() => handleCompanyFilterChange(undefined)}>
                {companies.find((c: any) => (c._id || c.id) === companyFilter)?.name || 'Company'}
              </Tag>
            )}
          </Title>
          <Text type="secondary">{t('manage_employees')}</Text>
        </div>
        <Space>
          <Button icon={<Download size={16} />} onClick={() => exportToCsv(users, [
            { key: 'firstName', title: 'First Name' },
            { key: 'lastName', title: 'Last Name' },
            { key: 'email', title: 'Email' },
            { key: 'phone', title: 'Phone' },
            { key: 'role', title: 'Role', render: (v: string) => roleLabel[v] || v },
            { key: 'isActive', title: 'Status', render: (v: boolean) => v ? 'Active' : 'Inactive' },
          ], 'users')}>{t('export')}</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/admin/users/create')}>{t('add_user')}</Button>
          <Button icon={<Mail size={16} />} onClick={() => navigate('/admin/users/invite')}>Invite User</Button>
        </Space>
      </div>

      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'users',
              label: <span className="flex items-center gap-1.5"><UserCheck size={15} /> Users ({filteredUsers.length})</span>,
              children: (
                <>
                  <div className="mb-4 flex flex-wrap gap-3">
                    <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={searchText} onChange={(e) => setSearchText(e.target.value)} className="max-w-xs" allowClear />
                    {isSuperAdmin && (
                      <Select
                        placeholder="All Companies"
                        value={companyFilter}
                        onChange={handleCompanyFilterChange}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        className="min-w-[200px]"
                        options={companies.map((c: any) => ({ value: c._id || c.id, label: c.name }))}
                      />
                    )}
                  </div>
                  <Table columns={userColumns} dataSource={filteredUsers} loading={isLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
                </>
              ),
            },
            {
              key: 'invitations',
              label: <span className="flex items-center gap-1.5"><Mail size={15} /> Invitations ({filteredInvitations.filter((i: any) => i.status === 'pending').length})</span>,
              children: (
                <Table columns={invitationColumns} dataSource={filteredInvitations} loading={invitesLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
              ),
            },
          ]}
        />
      </Card>

      {/* Invitation Link Modal (kept - not a drawer) */}
      <Modal title={<span className="flex items-center gap-2"><Link2 size={18} /> Invitation Link Created</span>}
        open={!!invitationLink} onCancel={() => setInvitationLink(null)}
        footer={<Button onClick={() => setInvitationLink(null)}>Done</Button>} width={560}>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">Share this link with the user. It expires in <strong>3 days</strong> and can only be used once.</p>
          <div className="flex gap-2">
            <Input value={invitationLink || ''} readOnly className="font-mono text-xs" />
            <Button type="primary" icon={<Copy size={14} />} onClick={() => { copyToClipboard(invitationLink!); }}>Copy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
