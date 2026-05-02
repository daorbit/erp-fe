import React, { useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  DatePicker,
  Select,
  Space,
  Button,
} from 'antd';
import { Eye, BarChart2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useShiftSessions, useMyShiftSessions } from '@/hooks/queries/useShiftSessions';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useAppSelector } from '@/store';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

const ShiftSessionsList: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isEmployee = currentUser?.role === 'employee';

  const [status, setStatus] = useState<'active' | 'completed' | undefined>();
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = {
    page,
    limit: pageSize,
    status,
    employee: employeeId,
    dateFrom: range?.[0]?.startOf('day').toISOString(),
    dateTo: range?.[1]?.endOf('day').toISOString(),
  };

  const adminQuery = useShiftSessions(params, { refetchInterval: REFRESH_INTERVAL_MS, enabled: !isEmployee });
  const myQuery = useMyShiftSessions(params, { enabled: isEmployee });
  const { data, isLoading } = isEmployee ? myQuery : adminQuery;
  const records: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  // Employee list for the filter — admin view only.
  const { data: employeesData } = useEmployeeList(!isEmployee ? { limit: 1000 } : undefined);
  const employeeOptions = useMemo(() => {
    if (isEmployee) return [];
    const list: any[] = (employeesData as any)?.data ?? [];
    return list
      .map((emp) => {
        const u = emp.userId ?? {};
        const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Unknown';
        return {
          value: emp._id,
          label: emp.employeeId ? `${name} · ${emp.employeeId}` : name,
          search: `${name} ${emp.employeeId ?? ''} ${u.email ?? ''}`.toLowerCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [employeesData, isEmployee]);

  const columns = [
    ...(!isEmployee ? [{
      title: 'Employee',
      key: 'employee',
      width: 220,
      fixed: 'left' as const,
      render: (_: unknown, r: any) => {
        const emp = r.employee;
        const user = emp?.userId;
        const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
        return (
          <div className="leading-tight">
            <div className="font-medium whitespace-nowrap">{name}</div>
            <Text type="secondary" className="text-xs whitespace-nowrap">
              {emp?.employeeId ?? user?.email ?? ''}
            </Text>
          </div>
        );
      },
    }] : []),
    {
      title: 'Site',
      key: 'site',
      width: 220,
      render: (_: unknown, r: any) => {
        const site = r.site;
        const loc = r.siteLocation;
        if (!site) return '—';
        const sub = [loc?.name, loc?.city || site.city, site.stateName].filter(Boolean).join(' · ') || site.code || '';
        return (
          <div className="leading-tight">
            <div className="font-medium whitespace-nowrap">{site.name}</div>
            {sub && (
              <Text type="secondary" className="text-xs whitespace-nowrap">{sub}</Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'shiftDate',
      width: 120,
      render: (d: string) => (
        <span className="whitespace-nowrap">{dayjs(d).format('DD MMM YYYY')}</span>
      ),
    },
    {
      title: 'Check-in',
      dataIndex: 'shiftStartedAt',
      width: 100,
      render: (d: string) => (
        <span className="whitespace-nowrap">{dayjs(d).format('h:mm A')}</span>
      ),
    },
    {
      title: 'Check-out',
      dataIndex: 'shiftEndedAt',
      width: 100,
      render: (d?: string) => (
        <span className="whitespace-nowrap">{d ? dayjs(d).format('h:mm A') : '—'}</span>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      width: 110,
      render: (m?: number) => (m ? `${Math.floor(m / 60)}h ${m % 60}m` : '—'),
    },
    {
      title: 'Distance',
      dataIndex: 'totalDistanceMeters',
      width: 100,
      render: (v: number) => `${(v / 1000).toFixed(2)} km`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (s: string) => (
        <Tag color={s === 'active' ? 'green' : 'blue'}>{s.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Selfie',
      dataIndex: 'selfieUrl',
      width: 70,
      render: (u?: string) =>
        u ? (
          <img src={u} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          '—'
        ),
    },
    {
      title: '',
      key: 'action',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, r: any) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/shift-sessions/${r._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Title level={4} className="!mb-1">Shift Sessions</Title>
          <Text type="secondary">
            All employee shift punches with selfies and journey trails.
          </Text>
        </div>
        <Button
          icon={<BarChart2 size={14} />}
          onClick={() => navigate('/shift-sessions/report')}
        >
          Consolidated Report
        </Button>
      </div>

      <Card>
        <Space wrap className="mb-4">
          {!isEmployee && (
            <Select
              placeholder="Employee"
              allowClear
              showSearch
              style={{ width: 260 }}
              value={employeeId}
              onChange={(v) => {
                setEmployeeId(v);
                setPage(1);
              }}
              options={employeeOptions}
              filterOption={(input, option) =>
                (option as any)?.search?.includes(input.toLowerCase()) ?? false
              }
            />
          )}
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
          <RangePicker
            value={range as any}
            onChange={(v) => {
              setRange(v as any);
              setPage(1);
            }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total: pagination?.total ?? 0,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ShiftSessionsList;
