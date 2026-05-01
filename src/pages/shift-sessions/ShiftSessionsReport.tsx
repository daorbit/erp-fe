import React, { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Download, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useShiftSessions } from '@/hooks/queries/useShiftSessions';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type QuickFilter = 'today' | 'week' | 'month' | 'custom';

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
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('today');
  const [customRange, setCustomRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [status, setStatus] = useState<'active' | 'completed' | undefined>();

  const activeRange = quickFilter === 'custom' ? customRange : getRange(quickFilter);

  const { data, isLoading } = useShiftSessions({
    limit: 1000,
    status,
    dateFrom: activeRange?.[0]?.format('YYYY-MM-DD'),
    dateTo: activeRange?.[1]?.format('YYYY-MM-DD'),
  });

  const records: any[] = data?.data ?? [];

  // Summary stats
  const stats = useMemo(() => {
    const completed = records.filter((r) => r.status === 'completed');
    const active = records.filter((r) => r.status === 'active');
    const totalMinutes = completed.reduce((sum, r) => sum + (r.durationMinutes ?? 0), 0);
    const totalKm = records.reduce((sum, r) => sum + (r.totalDistanceMeters ?? 0) / 1000, 0);
    return { total: records.length, active: active.length, completed: completed.length, totalMinutes, totalKm };
  }, [records]);

  // CSV download
  const handleDownload = () => {
    const headers = [
      'Employee Name', 'Employee ID', 'Email',
      'Site', 'Site Location',
      'Date', 'Started', 'Ended',
      'Duration (min)', 'Distance (km)',
      'GPS Pings', 'Status',
    ];

    const rows = records.map((r) => {
      const emp = r.employee;
      const user = emp?.userId;
      const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
      const site = r.site;
      const loc = r.siteLocation;
      return [
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
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-sessions-report-${dayjs().format('YYYY-MM-DD')}.csv`;
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
      title: 'Distance',
      dataIndex: 'totalDistanceMeters',
      render: (v: number) => `${(v / 1000).toFixed(2)} km`,
    },
    {
      title: 'GPS Pings',
      key: 'pings',
      render: (_: unknown, r: any) => r.gpsTrail?.length ?? 0,
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
        </div>
        <Button
          type="primary"
          icon={<Download size={14} />}
          onClick={handleDownload}
          disabled={records.length === 0}
        >
          Download CSV
        </Button>
      </div>

      {/* Quick filter + controls */}
      <Card bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          {(['today', 'week', 'month'] as QuickFilter[]).map((f) => (
            <Button
              key={f}
              type={quickFilter === f ? 'primary' : 'default'}
              size="small"
              onClick={() => setQuickFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
          <Button
            size="small"
            type={quickFilter === 'custom' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('custom')}
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
      </Card>

      {/* Summary stats */}
      <Row gutter={[12, 12]}>
        {[
          { title: 'Total Sessions', value: stats.total },
          { title: 'Active', value: stats.active, suffix: undefined },
          { title: 'Completed', value: stats.completed },
          { title: 'Total Hours', value: (stats.totalMinutes / 60).toFixed(1), suffix: 'h' },
          { title: 'Total Distance', value: stats.totalKm.toFixed(1), suffix: 'km' },
        ].map((s) => (
          <Col key={s.title} xs={12} sm={8} md={4}>
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
        <Table
          columns={columns}
          dataSource={records}
          rowKey="_id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} records` }}
        />
      </Card>
    </div>
  );
};

export default ShiftSessionsReport;
