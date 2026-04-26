import React, { useMemo, useState } from 'react';
import { Card, Button, Typography, DatePicker, Select, Radio, Input, Table } from 'antd';
import { FileSpreadsheet } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { SiteTreeFilter } from './_shared';

const { Title, Text } = Typography;

type Filters = {
  fromDate: Dayjs;
  toDate: Dayjs;
  userType: string;
  userName: string;
  siteIds: string[];
  orderBy: 'login_date' | 'user_name' | 'employee_name' | 'unique_ip' | 'first_login';
};

export default function LoginLogReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = dayjs();
  const initial: Filters = {
    fromDate: today, toDate: today, userType: 'all', userName: 'all',
    siteIds: [], orderBy: 'login_date',
  };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  // Lookup helper: audit rows store either a user id or a populated user
  // doc. Reading userType from the User collection avoids the case where
  // older audit records have a stale userRole denormalisation.
  const userById = useMemo(() => {
    const m: Record<string, any> = {};
    for (const u of users) m[u._id || u.id] = u;
    return m;
  }, [users]);
  const lookupUser = (e: any) => {
    const id = typeof e.user === 'object' ? e.user?._id : e.user;
    return id ? userById[id] : undefined;
  };

  // Login events come from audit-logs filtered to action=login.
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {
      action: 'login',
      from: applied.fromDate.startOf('day').toISOString(),
      to: applied.toDate.endOf('day').toISOString(),
      limit: '500',
    };
    if (applied.userName !== 'all') p.userId = applied.userName;
    if (applied.userType !== 'all') p.userType = applied.userType;
    if (applied.siteIds.length) p.siteIds = applied.siteIds.join(',');
    if (applied.orderBy) p.orderBy = applied.orderBy;
    return p;
  }, [applied]);

  // Each individual filter is in the key so any change — including reverting
  // to ALL — forces TanStack to refetch with the new query.
  const { data, isLoading } = useQuery({
    queryKey: [
      'login-log',
      applied.fromDate.startOf('day').toISOString(),
      applied.toDate.endOf('day').toISOString(),
      applied.userType,
      applied.userName,
      applied.orderBy,
      applied.siteIds.join(','),
    ],
    queryFn: () => api.get('/audit-logs', queryParams),
  });
  const events: any[] = ((data as any)?.data ?? []) as any[];

  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  const filtered = useMemo(() => events.filter((e) => {
    for (const [k, v] of Object.entries(colFilters)) {
      if (!v) continue;
      const val = (() => {
        switch (k) {
          case 'login': return dayjs(e.createdAt).format('DD/MM/YYYY HH:mm');
          case 'logout': return e.logoutAt ? dayjs(e.logoutAt).format('DD/MM/YYYY HH:mm') : '#';
          case 'ip': return e.ip;
          case 'user': return e.user?.username || e.userEmail || e.userName;
          case 'fullName': return [e.user?.firstName, e.user?.lastName].filter(Boolean).join(' ');
          case 'employee': return e.user?.employeeId;
          case 'userType': return lookupUser(e)?.userType || e.userRole;
          case 'webApp': return e.userAgent;
          default: return '';
        }
      })();
      if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  }), [events, colFilters]);

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Login Log</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">From Date</span>
              <div className="flex items-center gap-2">
                <DatePicker size="small" format="DD/MM/YYYY" value={draft.fromDate}
                  onChange={(d) => setDraft({ ...draft, fromDate: d || dayjs() })} />
                <span className="text-xs">To</span>
                <DatePicker size="small" format="DD/MM/YYYY" value={draft.toDate}
                  onChange={(d) => setDraft({ ...draft, toDate: d || dayjs() })} />
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Name</span>
              <Select size="small" value={draft.userName} onChange={(v) => setDraft({ ...draft, userName: v })}
                showSearch optionFilterProp="label"
                options={[{ value: 'all', label: 'ALL' }, ...users.map((u) => ({
                  value: u._id || u.id,
                  label: (u.username || u.email || '').toUpperCase(),
                }))]}
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Order by</span>
              <Radio.Group size="small" value={draft.orderBy}
                onChange={(e) => setDraft({ ...draft, orderBy: e.target.value })}>
                <Radio value="login_date">Login Date</Radio>
                <Radio value="user_name">User Name</Radio>
                <Radio value="employee_name">Employee Name</Radio>
                <Radio value="unique_ip">User Wise Distinct / Unique IP</Radio>
                <Radio value="first_login">First Login Date Time</Radio>
              </Radio.Group>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Type</span>
              <Select size="small" value={draft.userType} onChange={(v) => setDraft({ ...draft, userType: v })}
                options={[
                  { value: 'all', label: 'ALL' },
                  { value: 'super_admin', label: 'SUPERADMIN' },
                  { value: 'admin', label: 'ADMIN' },
                  { value: 'ho_user', label: 'HO-USER' },
                  { value: 'site_admin', label: 'SITE-ADMIN' },
                  { value: 'user', label: 'USER' },
                ]}
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Name</span>
              <SiteTreeFilter value={draft.siteIds} onChange={(v) => setDraft({ ...draft, siteIds: v })} />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => {
            // Apply the draft filters AND invalidate the cached login-log
            // query so TanStack always fetches fresh data — even when
            // reverting to a previously-seen combination like ALL.
            setApplied(draft);
            queryClient.invalidateQueries({ queryKey: ['login-log'] });
          }}>Search</Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Total {filtered.length} Records
          <Text type="danger" className="ml-3 text-xs">(# = Closed Without Logout)</Text>
        </div>
        <Button danger icon={<FileSpreadsheet size={14} />}>Export To Excel</Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          loading={isLoading}
          rowKey={(r) => r._id || r.id}
          size="small"
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 50 }}
          columns={[
            { title: <div><div>SrNo.</div>{filterCell('sr')}</div>, key: 'sr', width: 70, render: (_, __, i) => i + 1 },
            { title: <div><div>Login</div>{filterCell('login')}</div>, key: 'login', width: 150,
              render: (_, r) => dayjs(r.createdAt).format('DD/MM/YYYY HH:mm') },
            { title: <div><div>Logout</div>{filterCell('logout')}</div>, key: 'logout', width: 130,
              render: (_, r) => r.logoutAt ? dayjs(r.logoutAt).format('DD/MM/YYYY HH:mm') : '#' },
            { title: <div><div>IP Address</div>{filterCell('ip')}</div>, key: 'ip', width: 140,
              render: (_, r) => r.ip || '' },
            { title: <div><div>User Name</div>{filterCell('user')}</div>, key: 'user',
              render: (_, r) => r.user?.username || r.userEmail || r.userName || '' },
            { title: <div><div>User Full Name</div>{filterCell('fullName')}</div>, key: 'fullName',
              render: (_, r) => [r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ').toUpperCase() },
            { title: <div><div>Employee Name</div>{filterCell('employee')}</div>, key: 'employee',
              render: (_, r) => r.user?.employeeId || '' },
            { title: <div><div>User Type</div>{filterCell('userType')}</div>, key: 'userType', width: 120,
              render: (_, r) => {
                // Prefer the User.userType (matches the dropdown values like
                // HO-USER / SITE-ADMIN); fall back to the audit log's
                // userRole if userType isn't set on the user record.
                const u = lookupUser(r);
                const v = u?.userType || r.userRole || u?.role || '';
                return v.toUpperCase().replace(/_/g, '-');
              } },
            { title: <div><div>WEB/APP Type</div>{filterCell('webApp')}</div>, key: 'webApp', width: 120,
              render: (_, r) => {
                const ua = (r.userAgent || '').toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'APP';
                if (ua) return 'WEB';
                return '';
              } },
          ]}
        />
      </Card>
    </div>
  );
}
