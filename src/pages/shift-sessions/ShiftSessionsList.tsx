import React, { useState } from 'react';
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
import { Eye } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useShiftSessions } from '@/hooks/queries/useShiftSessions';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;

const ShiftSessionsList: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'active' | 'completed' | undefined>();
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = {
    page,
    limit: pageSize,
    status,
    dateFrom: range?.[0]?.format('YYYY-MM-DD'),
    dateTo: range?.[1]?.format('YYYY-MM-DD'),
  };

  const { data, isLoading } = useShiftSessions(params, { refetchInterval: REFRESH_INTERVAL_MS });
  const records: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_: unknown, r: any) => {
        const emp = r.employee;
        const user = emp?.userId;
        const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
        return (
          <div>
            <div className="font-medium">{name}</div>
            <Text type="secondary" className="text-xs">
              {emp?.employeeId ?? user?.email ?? ''}
            </Text>
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
            <div className="font-medium">{site.name}</div>
            <Text type="secondary" className="text-xs">
              {[loc?.name, loc?.city || site.city, site.stateName].filter(Boolean).join(' · ') || site.code || ''}
            </Text>
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
      title: 'Started',
      dataIndex: 'shiftStartedAt',
      render: (d: string) => dayjs(d).format('h:mm A'),
    },
    {
      title: 'Ended',
      dataIndex: 'shiftEndedAt',
      render: (d?: string) => (d ? dayjs(d).format('h:mm A') : '—'),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      render: (m?: number) => (m ? `${Math.floor(m / 60)}h ${m % 60}m` : '—'),
    },
    {
      title: 'Distance',
      dataIndex: 'totalDistanceMeters',
      render: (v: number) => `${(v / 1000).toFixed(2)} km`,
    },
    {
      title: 'Current Location',
      key: 'latestLocation',
      render: (_: unknown, r: any) => r.latestLocation
        ? `${r.latestLocation.latitude.toFixed(5)}, ${r.latestLocation.longitude.toFixed(5)}`
        : '—',
    },
    {
      title: 'From Site',
      dataIndex: 'latestSiteDistanceMeters',
      render: (v?: number) => (v != null ? `${Math.round(v)} m` : 'No coordinates'),
    },
    {
      title: 'Buffer',
      key: 'buffer',
      render: (_: unknown, r: any) => {
        if (!r.siteBufferKm) return '—';
        const ok = r.latestSiteWithinBuffer;
        return (
          <Tag color={ok ? 'green' : 'red'}>
            {ok ? 'INSIDE' : 'OUTSIDE'} {r.siteBufferKm} km
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color={s === 'active' ? 'green' : 'blue'}>{s.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Selfie',
      dataIndex: 'selfieUrl',
      render: (u?: string) =>
        u ? (
          <img src={u} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          '—'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, r: any) => (
        <Button
          type="link"
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
      <div>
        <Title level={4} className="!mb-1">Shift Sessions</Title>
        <Text type="secondary">
          All employee shift punches with selfies and journey trails.
        </Text>
      </div>

      <Card>
        <Space wrap className="mb-4">
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
          scroll={{ x: 1100 }}
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
