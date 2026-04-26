import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, DatePicker, Input, InputNumber, Select, Radio, Table, App, Popconfirm } from 'antd';
import { FileSpreadsheet, UserX } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { CountedTreeSelect } from '@/components/master/CountedSelect';
import { useSiteTree } from './_shared';

const { Title, Text } = Typography;

const USER_TYPES = [
  { value: 'all', label: 'ALL' },
  { value: 'super_admin', label: 'SUPERADMIN' },
  { value: 'admin', label: 'ADMIN' },
  { value: 'site_admin', label: 'SITE-ADMIN' },
  { value: 'ho_user', label: 'HO-USER' },
  { value: 'user', label: 'USER' },
];

type Filters = {
  tillDate: Dayjs;
  siteIds: string[];
  notLoggedDays: number;
  userType: string;
  orderBy: 'login_date' | 'user_name' | 'employee_name';
};

type Row = {
  key: string;
  userId: string;
  login: string | null;
  idleDays: number;
  ipAddress: string;
  userName: string;
  employeeName: string;
  userType: string;
  webAppType: string;
  isActive: boolean;
};

export default function IdleUserReport() {
  const { message } = App.useApp();
  const qc = useQueryClient();

  const today = dayjs();
  const initial: Filters = {
    tillDate: today,
    siteIds: [],
    notLoggedDays: 0,
    userType: 'all',
    orderBy: 'login_date',
  };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const { siteTree } = useSiteTree();

  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  // Login events used to derive last-login per user.
  const { data: loginsData, isLoading: loginsLoading } = useQuery({
    queryKey: ['idle-login-events'],
    queryFn: () => api.get('/audit-logs', { action: 'login', limit: '5000' }),
    enabled: !!applied,
  });
  const logins: any[] = ((loginsData as any)?.data ?? []) as any[];

  // Build idle-user rows.
  const rows = useMemo<Row[]>(() => {
    if (!applied) return [];
    const lastByUser: Record<string, any> = {};
    for (const e of logins) {
      const uid = typeof e.user === 'object' ? e.user?._id : e.user;
      if (!uid) continue;
      const t = e.createdAt;
      const tm = dayjs(t);
      if (!lastByUser[uid] || tm.isAfter(dayjs(lastByUser[uid].t))) {
        // Audit log model stores `ip` and `userAgent`, not `ipAddress` / `source`.
        lastByUser[uid] = { t, ip: e.ip, userAgent: e.userAgent };
      }
    }
    const cutoff = applied.tillDate.subtract(applied.notLoggedDays || 0, 'day');
    const list: Row[] = users
      .filter((u) => applied.userType === 'all' || u.role === applied.userType)
      .map((u) => {
        const last = lastByUser[u._id || u.id];
        const lastT = last ? dayjs(last.t) : null;
        const idleDays = lastT
          ? Math.max(0, applied.tillDate.startOf('day').diff(lastT.startOf('day'), 'day'))
          : Number.MAX_SAFE_INTEGER;
        return {
          key: u._id || u.id,
          userId: u._id || u.id,
          login: lastT ? lastT.format('DD/MM/YYYY HH:mm') : null,
          idleDays,
          ipAddress: last?.ip || '',
          userName: (u.username || u.email || '').toUpperCase(),
          employeeName: [u.firstName, u.lastName].filter(Boolean).join(' ').toUpperCase()
            || u.employeeId || '',
          userType: (u.role || '').toUpperCase().replace(/_/g, '-'),
          webAppType: (() => {
            const ua = (last?.userAgent || '').toLowerCase();
            if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'APP';
            return last ? 'WEB' : '';
          })(),
          isActive: !!u.isActive,
        };
      })
      .filter((r) => r.idleDays >= (applied.notLoggedDays || 0));

    list.sort((a, b) => {
      switch (applied.orderBy) {
        case 'user_name': return a.userName.localeCompare(b.userName);
        case 'employee_name': return a.employeeName.localeCompare(b.employeeName);
        case 'login_date':
        default:
          if (!a.login && !b.login) return 0;
          if (!a.login) return -1;
          if (!b.login) return 1;
          return dayjs(b.login, 'DD/MM/YYYY HH:mm').valueOf()
            - dayjs(a.login, 'DD/MM/YYYY HH:mm').valueOf();
      }
    });
    return list;
  }, [users, logins, applied]);

  const filtered = useMemo(() => rows.filter((r) => {
    for (const [k, v] of Object.entries(colFilters)) {
      if (!v) continue;
      const val = (() => {
        switch (k) {
          case 'login': return r.login || '';
          case 'idleDays': return String(r.idleDays);
          case 'ip': return r.ipAddress;
          case 'userName': return r.userName;
          case 'employee': return r.employeeName;
          case 'userType': return r.userType;
          case 'webApp': return r.webAppType;
          default: return '';
        }
      })();
      if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  }), [rows, colFilters]);

  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  // Deactivate user via /auth/users/:id/toggle-status — same endpoint the user-management page uses.
  const deactivateMut = useMutation({
    mutationFn: (userId: string) => api.patch(`/auth/users/${userId}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-all-min'] });
      message.success('User marked inactive');
    },
    onError: (err: any) => message.error(err?.message || 'Failed'),
  });

  const handleExportExcel = () => {
    const rows = filtered.map((r, i) => [
      String(i + 1),
      r.login ?? '#',
      String(r.idleDays),
      r.ipAddress,
      r.userName,
      r.employeeName,
      r.userType,
      r.webAppType,
    ]);
    const header = ['SrNo.', 'Login', 'Idle Days', 'IP Address', 'User Name', 'Employee Name', 'User Type', 'WEB/APP Type'];
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'idle-user-report.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Idle User Report</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Till Date</span>
              <DatePicker size="small" format="DD/MM/YYYY" value={draft.tillDate}
                onChange={(d) => setDraft({ ...draft, tillDate: d || dayjs() })} />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Name</span>
              <CountedTreeSelect treeData={siteTree as any} value={draft.siteIds}
                onChange={(v) => setDraft({ ...draft, siteIds: v as string[] })}
                placeholder="None Selected means filter does not apply" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Not Logged In From</span>
              <div className="flex items-center gap-2">
                <InputNumber size="small" min={0} value={draft.notLoggedDays}
                  onChange={(v) => setDraft({ ...draft, notLoggedDays: Number(v) || 0 })}
                  style={{ width: 120 }} />
                <span className="text-xs">Days</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Type</span>
              <Select size="small" value={draft.userType}
                onChange={(v) => setDraft({ ...draft, userType: v })}
                options={USER_TYPES} />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Order by</span>
              <Radio.Group size="small" value={draft.orderBy}
                onChange={(e) => setDraft({ ...draft, orderBy: e.target.value })}>
                <Radio value="login_date">Login Date</Radio>
                <Radio value="user_name">User Name</Radio>
                <Radio value="employee_name">Employee Name</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => setApplied(draft)}>Search</Button>
          <Button danger onClick={() => { setDraft(initial); setApplied(null); setColFilters({}); }}>Close</Button>
        </div>
      </Card>

      {applied && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Total {filtered.length} Records
              <Text type="danger" className="ml-3 text-xs">(# = Closed Without Logout)</Text>
            </div>
            <Button danger icon={<FileSpreadsheet size={14} />} onClick={handleExportExcel}>Export To Excel</Button>
          </div>

          <Card bordered={false} className="!rounded-lg !shadow-sm">
            <Table
              dataSource={filtered}
              loading={loginsLoading}
              rowKey="key"
              size="small"
              scroll={{ x: 1500 }}
              pagination={{ pageSize: 50 }}
              columns={[
                { title: <div><div>SrNo.</div>{filterCell('sr')}</div>, key: 'sr', width: 80,
                  render: (_, __, i) => i + 1 },
                { title: <div><div>Login</div>{filterCell('login')}</div>, key: 'login', width: 170,
                  sorter: (a, b) => {
                    const ta = a.login ? dayjs(a.login, 'DD/MM/YYYY HH:mm').valueOf() : 0;
                    const tb = b.login ? dayjs(b.login, 'DD/MM/YYYY HH:mm').valueOf() : 0;
                    return ta - tb;
                  },
                  render: (_, r) => r.login ?? <span className="text-red-600">#</span> },
                { title: <div><div>Idle Days</div>{filterCell('idleDays')}</div>, key: 'idleDays', width: 110,
                  sorter: (a, b) => a.idleDays - b.idleDays,
                  render: (_, r) => r.idleDays === Number.MAX_SAFE_INTEGER
                    ? 'Never logged in' : `${r.idleDays} days` },
                { title: <div><div>IP Address</div>{filterCell('ip')}</div>, dataIndex: 'ipAddress', key: 'ip', width: 150 },
                { title: <div><div>User Name</div>{filterCell('userName')}</div>, dataIndex: 'userName', key: 'userName' },
                { title: <div><div>Employee Name</div>{filterCell('employee')}</div>, dataIndex: 'employeeName', key: 'employee' },
                { title: <div><div>User Type</div>{filterCell('userType')}</div>, dataIndex: 'userType', key: 'userType', width: 130 },
                { title: <div><div>WEB/APP Type</div>{filterCell('webApp')}</div>, dataIndex: 'webAppType', key: 'webApp', width: 130 },
                { title: 'Action', key: 'action', width: 130, fixed: 'right' as const,
                  render: (_, r) => r.isActive ? (
                    <Popconfirm title="Mark this user inactive?"
                      onConfirm={() => deactivateMut.mutate(r.userId)}>
                      <Button type="link" size="small" danger icon={<UserX size={14} />}
                        loading={deactivateMut.isPending && deactivateMut.variables === r.userId}>
                        Inactive
                      </Button>
                    </Popconfirm>
                  ) : <Text type="secondary" className="text-xs">Inactive</Text>,
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
