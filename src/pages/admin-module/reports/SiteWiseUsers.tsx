import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, Select, Radio, Input, Table } from 'antd';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useSiteTree } from './_shared';

const { Title } = Typography;

const USER_TYPES = [
  { value: 'all', label: 'ALL' },
  { value: 'super_admin', label: 'SUPERADMIN' },
  { value: 'site_admin', label: 'SITE-ADMIN' },
  { value: 'admin', label: 'ADMIN' },
  { value: 'ho_user', label: 'HO-USER' },
  { value: 'user', label: 'USER' },
];

const DEPARTMENTS = [
  'ADMIN', 'ADMIN-ACCOUNTS', 'CORRESPONDENCE', 'HUMAN-RESOURCE', 'MACHINERY',
  'MIS-ADMIN', 'PRODUCTION', 'PROJECT-MANAGEMENT', 'PURCHASE', 'STORE', 'TENDER',
];

type GroupBy = 'user_type' | 'user_name' | 'site_name' | 'module_name';

type Filters = {
  userType: string;
  siteId: string;
  department: string;
  userName: string;
  groupBy: GroupBy;
  userStatus: 'active' | 'inactive' | 'all';
};

type Row = {
  key: string;
  siteName: string;
  userName: string;
  moduleName: string;
  employeeName: string;
  userType: string;
};

export default function SiteWiseUsersList() {
  const initial: Filters = {
    userType: 'all', siteId: 'all', department: 'all', userName: 'all',
    groupBy: 'user_type', userStatus: 'active',
  };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [hasSearched, setHasSearched] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const { branches } = useSiteTree();

  // Lightweight user list for the User Name dropdown — only the dropdown,
  // not the table. The table data comes from the backend search endpoint.
  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  const userOptions = useMemo(() => [
    { value: 'all', label: 'ALL' },
    ...users.map((u) => ({
      value: u._id || u.id,
      label: (u.username || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim()).toUpperCase(),
    })).sort((a, b) => a.label.localeCompare(b.label)),
  ], [users]);

  // Backend search — only fires when `hasSearched` is true (i.e. user clicked Search).
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (applied.userType !== 'all') p.userType = applied.userType;
    if (applied.siteId !== 'all') p.siteId = applied.siteId;
    if (applied.department !== 'all') p.department = applied.department;
    if (applied.userName !== 'all') p.userId = applied.userName;
    p.userStatus = applied.userStatus;
    p.groupBy = applied.groupBy;
    return p;
  }, [applied]);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['site-wise-users', queryParams],
    queryFn: () => api.get('/reports/site-wise-users', queryParams),
    enabled: hasSearched,
  });

  type ServerRow = Omit<Row, 'key'>;
  type ServerGroup = { label: string; field: string; count: number; rows: ServerRow[] };
  const groups: ServerGroup[] = ((reportData as any)?.data?.groups ?? []) as ServerGroup[];

  // Apply column filters client-side over the server-returned rows.
  const groupedRows = useMemo(() => {
    const out: ({ _group: true; label: string; field: string } | (Row & { _group?: false }))[] = [];
    const matches = (r: ServerRow) => {
      for (const [k, v] of Object.entries(colFilters)) {
        if (!v) continue;
        const val = (() => {
          switch (k) {
            case 'siteName': return r.siteName;
            case 'userName': return r.userName;
            case 'moduleName': return r.moduleName;
            case 'employeeName': return r.employeeName;
            default: return '';
          }
        })();
        if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
      }
      return true;
    };
    for (const g of groups) {
      const list = g.rows.filter(matches);
      if (list.length === 0) continue;
      out.push({ _group: true, label: g.label, field: g.field });
      list.forEach((r, i) => out.push({
        ...r,
        key: `${g.label}-${i}`,
      }));
    }
    return out;
  }, [groups, colFilters]);

  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Site Wise User's List</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Left column */}
          <div className="space-y-2">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Type</span>
              <Select size="small" value={draft.userType}
                onChange={(v) => setDraft({ ...draft, userType: v })}
                options={USER_TYPES} />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Name</span>
              <Select size="small" value={draft.siteId}
                onChange={(v) => setDraft({ ...draft, siteId: v })}
                showSearch optionFilterProp="label"
                options={[
                  { value: 'all', label: 'ALL' },
                  ...branches.map((b) => ({ value: b._id, label: b.name })),
                ]} />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Department Name</span>
              <Select size="small" value={draft.department}
                onChange={(v) => setDraft({ ...draft, department: v })}
                options={[
                  { value: 'all', label: 'ALL' },
                  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]} />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-2">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Name</span>
              <Select size="small" value={draft.userName}
                onChange={(v) => setDraft({ ...draft, userName: v })}
                showSearch optionFilterProp="label" options={userOptions} />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Group By</span>
              <Radio.Group size="small" value={draft.groupBy}
                onChange={(e) => setDraft({ ...draft, groupBy: e.target.value })}>
                <Radio value="user_type">User Type</Radio>
                <Radio value="user_name">User Name</Radio>
                <Radio value="site_name">Site Name</Radio>
                <Radio value="module_name">Module Name</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Status</span>
              <Radio.Group size="small" value={draft.userStatus}
                onChange={(e) => setDraft({ ...draft, userStatus: e.target.value })}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">All</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => { setApplied(draft); setHasSearched(true); }}>
            Search
          </Button>
          <Button danger onClick={() => {
            setDraft(initial); setApplied(initial); setHasSearched(false); setColFilters({});
          }}>
            Close
          </Button>
        </div>
      </Card>

      {hasSearched && (
        <>
          <div className="flex justify-end gap-2">
            <Button danger icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
            <Button danger icon={<FileSpreadsheet size={14} />}>Print Excel</Button>
          </div>

          <Card bordered={false} className="!rounded-lg !shadow-sm">
            <Table
          dataSource={groupedRows}
          loading={isLoading}
          rowKey={(r: any) => r._group ? `g-${r.label}` : r.key}
          size="small"
          bordered
          pagination={false}
          locale={{ emptyText: 'No users found for the selected filters.' }}
          rowClassName={(r: any) => r._group ? 'font-semibold' : ''}
          columns={[
            { title: <div><div>SrNo.</div>{filterCell('sr')}</div>, key: 'sr', width: 90,
              render: (_, r: any, i) => r._group ? '' : i + 1 },
            { title: <div><div>Site Name</div>{filterCell('siteName')}</div>, key: 'siteName',
              render: (_, r: any) => r._group
                ? <span className="text-red-600 font-bold">{r.field}</span>
                : r.siteName },
            { title: <div><div>User Name</div>{filterCell('userName')}</div>, key: 'userName',
              render: (_, r: any) => r._group
                ? <span className="text-red-600 font-bold">{r.label}</span>
                : r.userName },
            { title: <div><div>Module Name</div>{filterCell('moduleName')}</div>, key: 'moduleName',
              render: (_, r: any) => r._group ? '' : r.moduleName },
            { title: <div><div>Employee Name</div>{filterCell('employeeName')}</div>, key: 'employeeName',
              render: (_, r: any) => r._group ? '' : r.employeeName },
          ]}
        />
          </Card>
        </>
      )}
    </div>
  );
}
