import React, { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Download, ArrowLeft, RefreshCw, Building2, ListChecks, Users, X } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShiftSessions, useMyShiftSessions } from '@/hooks/queries/useShiftSessions';
import { useAppSelector } from '@/store';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type QuickFilter = 'today' | 'week' | 'month' | 'custom';
type ViewMode = 'sessions' | 'sites' | 'employees';

function getRange(filter: QuickFilter): [dayjs.Dayjs, dayjs.Dayjs] | null {
  if (filter === 'today') return [dayjs().startOf('day'), dayjs().endOf('day')];
  if (filter === 'week') return [dayjs().startOf('week'), dayjs().endOf('week')];
  if (filter === 'month') return [dayjs().startOf('month'), dayjs().endOf('month')];
  return null;
}

function formatDuration(minutes?: number) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ShiftSessionsReport: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isEmployee = currentUser?.role === 'employee';

  const [quickFilter, setQuickFilter] = useState<QuickFilter>('today');
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [status, setStatus] = useState<'active' | 'completed' | undefined>();
  const [view, setView] = useState<ViewMode>('employees');

  // `?site=<id>` and `?employee=<id>` let other pages (e.g. the admin Site
  // List) and inline drill-downs deep-link into the report pre-filtered.
  const siteFilter = searchParams.get('site') || undefined;
  const employeeFilter = searchParams.get('employee') || undefined;

  const activeRange = quickFilter === 'custom' ? customRange : getRange(quickFilter);

  // Send full ISO timestamps (with TZ offset) so server-vs-client timezone
  // skew can't drop records out of the requested window. RangePicker hands
  // back midnight-local dayjs values; widen them to a full local-day window.
  const queryParams = {
    limit: 1000,
    status,
    site: siteFilter,
    employee: employeeFilter,
    dateFrom: activeRange?.[0]?.startOf('day').toISOString(),
    dateTo: activeRange?.[1]?.endOf('day').toISOString(),
  };

  const clearParam = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const drillTo = (key: 'site' | 'employee', id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, id);
    setSearchParams(next, { replace: true });
    setView('sessions');
  };

  // Only the role-appropriate hook is enabled — the other stays idle so we
  // don't fire requests the backend will reject (e.g. /my for an admin).
  // staleTime: 0 forces a network fetch every time the filter (and thus the
  // queryKey) changes — including when the user clicks back to a previously
  // selected filter — instead of serving the global 5-min cache.
  const adminQuery = useShiftSessions(queryParams, { enabled: !isEmployee, staleTime: 0 });
  const myQuery = useMyShiftSessions(queryParams, { enabled: isEmployee, staleTime: 0 });
  const activeQuery = isEmployee ? myQuery : adminQuery;
  const { data, isLoading, refetch } = activeQuery;

  const records: any[] = data?.data ?? [];

  const handlePickQuickFilter = (next: QuickFilter) => {
    setQuickFilter(next);
    if (next !== 'custom') setCustomRange(null);
  };

  const handleRefresh = () => {
    void refetch();
  };

  // Summary stats
  const stats = useMemo(() => {
    const completed = records.filter((r) => r.status === 'completed');
    const active = records.filter((r) => r.status === 'active');
    const totalMinutes = completed.reduce((sum, r) => sum + (r.durationMinutes ?? 0), 0);
    const employees = new Set(
      records.map((r) => String(r.employee?._id ?? r.employee)).filter(Boolean),
    );
    return {
      employees: employees.size,
      active: active.length,
      completed: completed.length,
      totalMinutes,
    };
  }, [records]);

  // Per-site rollup for the "By Site" view. Aggregates the same fetched
  // records so the date/status filters apply consistently to both views.
  const siteRows = useMemo(() => {
    const bySite = new Map<string, any>();
    for (const r of records) {
      const site = r.site;
      if (!site?._id) continue;
      const key = String(site._id);
      const existing = bySite.get(key) ?? {
        key,
        site,
        siteName: site.name ?? '—',
        siteCode: site.code ?? '',
        city: site.city ?? '',
        state: site.stateName ?? '',
        sessions: 0,
        active: 0,
        completed: 0,
        minutes: 0,
        km: 0,
        employees: new Set<string>(),
        lastActivityAt: 0,
      };
      existing.sessions += 1;
      if (r.status === 'active') existing.active += 1;
      else if (r.status === 'completed') existing.completed += 1;
      existing.minutes += r.durationMinutes ?? 0;
      existing.km += (r.totalDistanceMeters ?? 0) / 1000;
      const empId = r.employee?._id ?? r.employee;
      if (empId) existing.employees.add(String(empId));
      const last = new Date(r.shiftEndedAt ?? r.shiftStartedAt ?? 0).getTime();
      if (last > existing.lastActivityAt) existing.lastActivityAt = last;
      bySite.set(key, existing);
    }
    return Array.from(bySite.values())
      .map((row) => ({
        ...row,
        employeeCount: row.employees.size,
        employees: undefined,
        hours: row.minutes / 60,
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [records]);

  // Per-employee rollup for the "By Employee" view. Mirrors the site rollup
  // — same date/status filters apply, just grouped by employee instead.
  const employeeRows = useMemo(() => {
    const byEmp = new Map<string, any>();
    for (const r of records) {
      const emp = r.employee;
      const empId = emp?._id ?? emp;
      if (!empId) continue;
      const u = emp?.userId ?? {};
      const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Unknown';
      const key = String(empId);
      const existing = byEmp.get(key) ?? {
        key,
        employee: emp,
        employeeName: name,
        employeeCode: emp?.employeeId ?? '',
        email: u.email ?? '',
        sessions: 0,
        active: 0,
        completed: 0,
        minutes: 0,
        km: 0,
        sites: new Set<string>(),
        lastActivityAt: 0,
        latestSessionId: undefined as string | undefined,
      };
      existing.sessions += 1;
      if (r.status === 'active') existing.active += 1;
      else if (r.status === 'completed') existing.completed += 1;
      existing.minutes += r.durationMinutes ?? 0;
      existing.km += (r.totalDistanceMeters ?? 0) / 1000;
      const siteId = r.site?._id ?? r.site;
      if (siteId) existing.sites.add(String(siteId));
      const last = new Date(r.shiftEndedAt ?? r.shiftStartedAt ?? 0).getTime();
      if (last > existing.lastActivityAt) {
        existing.lastActivityAt = last;
        existing.latestSessionId = r._id;
      }
      byEmp.set(key, existing);
    }
    return Array.from(byEmp.values())
      .map((row) => ({
        ...row,
        siteCount: row.sites.size,
        sites: undefined,
        hours: row.minutes / 60,
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [records]);

  // CSV download — content matches the active view.
  const handleDownload = () => {
    const csvLine = (cells: (string | number)[]) =>
      cells.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');

    let headers: string[];
    let lines: string[];
    let filename: string;

    if (view === 'sites') {
      headers = ['Site', 'Code', 'City', 'State', 'Sessions', 'Active', 'Completed', 'Employees', 'Hours', 'Distance (km)', 'Last Activity'];
      lines = siteRows.map((r) =>
        csvLine([
          r.siteName,
          r.siteCode,
          r.city,
          r.state,
          r.sessions,
          r.active,
          r.completed,
          r.employeeCount,
          r.hours.toFixed(1),
          r.km.toFixed(2),
          r.lastActivityAt ? dayjs(r.lastActivityAt).format('DD MMM YYYY h:mm A') : '',
        ]),
      );
      filename = `shift-sites-report-${dayjs().format('YYYY-MM-DD')}.csv`;
    } else if (view === 'employees') {
      headers = ['Employee', 'Employee ID', 'Email', 'Sessions', 'Active', 'Completed', 'Sites', 'Hours', 'Distance (km)', 'Last Activity'];
      lines = employeeRows.map((r) =>
        csvLine([
          r.employeeName,
          r.employeeCode,
          r.email,
          r.sessions,
          r.active,
          r.completed,
          r.siteCount,
          r.hours.toFixed(1),
          r.km.toFixed(2),
          r.lastActivityAt ? dayjs(r.lastActivityAt).format('DD MMM YYYY h:mm A') : '',
        ]),
      );
      filename = `shift-employees-report-${dayjs().format('YYYY-MM-DD')}.csv`;
    } else {
      headers = [
        'Employee Name', 'Employee ID', 'Email',
        'Site', 'Site Location',
        'Date', 'Started', 'Ended',
        'Duration (min)', 'Distance (km)',
        'GPS Pings', 'Status',
      ];
      lines = records.map((r) => {
        const emp = r.employee;
        const user = emp?.userId;
        const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
        const site = r.site;
        const loc = r.siteLocation;
        return csvLine([
          name,
          emp?.employeeId ?? '',
          user?.email ?? '',
          site?.name ?? '',
          loc?.name ?? '',
          dayjs(r.shiftDate).format('DD MMM YYYY'),
          dayjs(r.shiftStartedAt).format('DD MMM YYYY h:mm A'),
          r.shiftEndedAt ? dayjs(r.shiftEndedAt).format('DD MMM YYYY h:mm A') : '',
          r.durationMinutes ?? '',
          ((r.totalDistanceMeters ?? 0) / 1000).toFixed(2),
          r.gpsTrail?.length ?? 0,
          r.status,
        ]);
      });
      filename = `shift-sessions-report-${dayjs().format('YYYY-MM-DD')}.csv`;
    }

    const csv = [csvLine(headers), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      render: (_: unknown, __: unknown, i: number) => i + 1,
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_: unknown, r: any) => {
        const emp = r.employee;
        const user = emp?.userId;
        const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
        return (
          <div>
            <div className="font-medium text-sm">{name}</div>
            <Text type="secondary" className="text-xs">{emp?.employeeId ?? user?.email ?? ''}</Text>
          </div>
        );
      },
    },
    {
      title: 'Site',
      key: 'site',
      render: (_: unknown, r: any) => {
        const site = r.site;
        const loc = r.siteLocation;
        return site ? (
          <div>
            <div className="font-medium text-sm">{site.name}</div>
            <Text type="secondary" className="text-xs">{[loc?.name, loc?.city || site.city].filter(Boolean).join(' · ')}</Text>
          </div>
        ) : '—';
      },
    },
    {
      title: 'Date',
      dataIndex: 'shiftDate',
      render: (d: string) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: 'Check-in',
      dataIndex: 'shiftStartedAt',
      render: (d: string) => dayjs(d).format('h:mm A'),
    },
    {
      title: 'Check-out',
      dataIndex: 'shiftEndedAt',
      render: (d?: string) => d ? dayjs(d).format('h:mm A') : <Text type="secondary">—</Text>,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      render: (m?: number) => m ? <Tag color="geekblue">{formatDuration(m)}</Tag> : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'blue'}>{s.toUpperCase()}</Tag>,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Title level={4} className="!mb-0.5">Consolidated Shift Report</Title>
          <Text type="secondary" className="text-sm">Download and filter shift session records</Text>
          {(siteFilter || employeeFilter) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {siteFilter && (
                <Tag
                  color="blue"
                  closable
                  closeIcon={<X size={12} />}
                  onClose={(e) => { e.preventDefault(); clearParam('site'); }}
                >
                  Site: {records[0]?.site?.name || siteFilter}
                </Tag>
              )}
              {employeeFilter && (
                <Tag
                  color="purple"
                  closable
                  closeIcon={<X size={12} />}
                  onClose={(e) => { e.preventDefault(); clearParam('employee'); }}
                >
                  Employee: {(() => {
                    const u = records[0]?.employee?.userId;
                    return u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email : employeeFilter;
                  })()}
                </Tag>
              )}
            </div>
          )}
        </div>
        <Space>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<Download size={14} />}
            onClick={handleDownload}
            disabled={records.length === 0}
          >
            Download CSV
          </Button>
        </Space>
      </div>

      {/* Quick filter + controls */}
      <Card bodyStyle={{ padding: '12px 16px' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Space wrap>
            {(['today', 'week', 'month'] as QuickFilter[]).map((f) => (
              <Button
                key={f}
                type={quickFilter === f ? 'primary' : 'default'}
                size="small"
                onClick={() => handlePickQuickFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
            <Button
              size="small"
              type={quickFilter === 'custom' ? 'primary' : 'default'}
              onClick={() => handlePickQuickFilter('custom')}
            >
              Custom
            </Button>
            {quickFilter === 'custom' && (
              <RangePicker
                size="small"
                value={customRange as any}
                onChange={(v) => setCustomRange(v as any)}
              />
            )}
            <Select
              placeholder="Status"
              allowClear
              size="small"
              style={{ width: 130 }}
              value={status}
              onChange={(v) => setStatus(v)}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
              ]}
            />
          </Space>
          <Segmented
            size="small"
            value={view}
            onChange={(v) => setView(v as ViewMode)}
            options={[
              { label: 'Sessions', value: 'sessions', icon: <ListChecks size={12} /> },
              { label: 'By Site', value: 'sites', icon: <Building2 size={12} /> },
              { label: 'By Employee', value: 'employees', icon: <Users size={12} /> },
            ]}
          />
        </div>
      </Card>

      {/* Summary stats */}
      <Row gutter={[12, 12]}>
        {[
          { title: 'Total Employees', value: stats.employees },
          { title: 'Active', value: stats.active, suffix: undefined },
          { title: 'Completed', value: stats.completed },
          { title: 'Total Hours', value: (stats.totalMinutes / 60).toFixed(1), suffix: 'h' },
        ].map((s) => (
          <Col key={s.title} xs={12} sm={8} md={6}>
            <Card bodyStyle={{ padding: '14px 16px' }}>
              <Statistic
                title={<span className="text-xs text-gray-400">{s.title}</span>}
                value={s.value}
                suffix={s.suffix}
                valueStyle={{ fontSize: 18, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <Card>
        {view === 'employees' ? (
          <Table
            columns={[
              {
                title: 'Employee',
                key: 'employee',
                width: 260,
                fixed: 'left' as const,
                render: (_: unknown, r: any) => (
                  <div className="leading-tight">
                    <div className="font-medium whitespace-nowrap">{r.employeeName}</div>
                    <Text type="secondary" className="text-xs whitespace-nowrap">
                      {[r.employeeCode, r.email].filter(Boolean).join(' · ') || '—'}
                    </Text>
                  </div>
                ),
              },
              {
                title: 'Minutes',
                dataIndex: 'minutes',
                width: 140,
                render: (m: number) => `${Math.round(m)} min`,
                sorter: (a: any, b: any) => a.minutes - b.minutes,
                defaultSortOrder: 'descend' as const,
              },
              {
                title: 'Last Activity',
                dataIndex: 'lastActivityAt',
                width: 200,
                render: (t: number) =>
                  t ? <span className="whitespace-nowrap">{dayjs(t).format('DD MMM, h:mm A')}</span> : '—',
              },
            ]}
            dataSource={employeeRows}
            rowKey="key"
            loading={isLoading}
            size="small"
            scroll={{ x: 700 }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} employees` }}
            locale={{ emptyText: 'No employee activity in this range' }}
            onRow={(r: any) => ({
              onClick: () => {
                if (r.latestSessionId) {
                  navigate(`/shift-sessions/${r.latestSessionId}`);
                } else {
                  drillTo('employee', r.key);
                }
              },
              style: { cursor: 'pointer' },
            })}
          />
        ) : view === 'sites' ? (
          <Table
            columns={[
              {
                title: 'Site',
                key: 'site',
                width: 260,
                fixed: 'left' as const,
                render: (_: unknown, r: any) => (
                  <div className="leading-tight">
                    <div className="font-medium whitespace-nowrap">{r.siteName}</div>
                    <Text type="secondary" className="text-xs whitespace-nowrap">
                      {[r.siteCode, r.city, r.state].filter(Boolean).join(' · ') || '—'}
                    </Text>
                  </div>
                ),
              },
              {
                title: 'Sessions',
                dataIndex: 'sessions',
                width: 100,
                sorter: (a: any, b: any) => a.sessions - b.sessions,
                defaultSortOrder: 'descend' as const,
              },
              {
                title: 'Active',
                dataIndex: 'active',
                width: 90,
                render: (v: number) => (v > 0 ? <Tag color="green">{v}</Tag> : v),
              },
              {
                title: 'Completed',
                dataIndex: 'completed',
                width: 110,
                render: (v: number) => (v > 0 ? <Tag color="blue">{v}</Tag> : v),
              },
              {
                title: 'Employees',
                dataIndex: 'employeeCount',
                width: 110,
                sorter: (a: any, b: any) => a.employeeCount - b.employeeCount,
              },
              {
                title: 'Hours',
                dataIndex: 'hours',
                width: 100,
                render: (h: number) => `${h.toFixed(1)}h`,
                sorter: (a: any, b: any) => a.hours - b.hours,
              },
              {
                title: 'Distance',
                dataIndex: 'km',
                width: 110,
                render: (v: number) => `${v.toFixed(2)} km`,
              },
              {
                title: 'Last Activity',
                dataIndex: 'lastActivityAt',
                width: 170,
                render: (t: number) =>
                  t ? <span className="whitespace-nowrap">{dayjs(t).format('DD MMM, h:mm A')}</span> : '—',
              },
            ]}
            dataSource={siteRows}
            rowKey="key"
            loading={isLoading}
            size="small"
            scroll={{ x: 1050 }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} sites` }}
            locale={{ emptyText: 'No site activity in this range' }}
            onRow={(r) => ({
              onClick: () => drillTo('site', r.key),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={records}
            rowKey="_id"
            loading={isLoading}
            size="small"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} records` }}
            onRow={(r: any) => ({
              onClick: () => navigate(`/shift-sessions/${r._id}`),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Card>
    </div>
  );
};

export default ShiftSessionsReport;
