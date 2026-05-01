import React, { useMemo, useState } from 'react';
import { Card, Col, DatePicker, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { MapPinned, Timer, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useShiftSiteDurationReport } from '@/hooks/queries/useShiftSessions';
import type { SiteDurationReportRow } from '@/services/shiftSessionService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function formatDuration(minutes?: number) {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatDistance(value?: number) {
  if (value == null) return '-';
  return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${Math.round(value)} m`;
}

const ShiftSiteDurationReport: React.FC = () => {
  const [status, setStatus] = useState<'active' | 'completed' | undefined>();
  const [site, setSite] = useState<string | undefined>();
  const [employee, setEmployee] = useState<string | undefined>();
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().startOf('month'),
    dayjs(),
  ]);

  const params = {
    status,
    site,
    dateFrom: range?.[0]?.format('YYYY-MM-DD'),
    dateTo: range?.[1]?.format('YYYY-MM-DD'),
  };

  const { data, isLoading } = useShiftSiteDurationReport(params);
  const report = data?.data;
  const rows = report?.rows ?? [];

  const employeeOptions = useMemo(() => {
    const options = new Map<string, { label: string; value: string }>();
    rows.forEach((row) => {
      const id = row.employee?._id;
      if (!id) return;
      options.set(String(id), {
        value: String(id),
        label: [row.employeeName, row.employeeCode].filter(Boolean).join(' - '),
      });
    });
    return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const filteredRows = employee
    ? rows.filter((row) => String(row.employee?._id) === employee)
    : rows;

  const totals = useMemo(() => {
    const employeeIds = new Set(filteredRows.map((row) => String(row.employee?._id ?? '')));
    const siteIds = new Set(filteredRows.map((row) => String(row.site?._id ?? '')));
    return {
      durationMinutes: filteredRows.reduce((sum, row) => sum + row.durationMinutes, 0),
      employeeCount: employeeIds.size,
      siteCount: siteIds.size,
      rowCount: filteredRows.length,
    };
  }, [filteredRows]);

  const { data: branchData } = useQuery({
    queryKey: ['branches', 'shift-site-duration-filter'],
    queryFn: () => api.get<any[]>('/branches', { limit: '500' }),
  });
  const siteOptions = (branchData?.data ?? []).map((branch: any) => ({
    value: branch._id,
    label: [branch.name, branch.code].filter(Boolean).join(' - '),
  }));

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      width: 120,
      render: (value: string) => dayjs(value).format('DD MMM YYYY'),
    },
    {
      title: 'Employee',
      key: 'employee',
      width: 220,
      render: (_: unknown, row: SiteDurationReportRow) => (
        <div>
          <div className="font-medium">{row.employeeName}</div>
          <Text type="secondary" className="text-xs">{row.employeeCode || row.employee?.userId?.email || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Site',
      key: 'site',
      width: 240,
      render: (_: unknown, row: SiteDurationReportRow) => (
        <div>
          <div className="font-medium">{row.siteName || '-'}</div>
          <Text type="secondary" className="text-xs">{[row.siteLocationName, row.siteCode].filter(Boolean).join(' - ') || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      width: 130,
      sorter: (a: SiteDurationReportRow, b: SiteDurationReportRow) => a.durationMinutes - b.durationMinutes,
      render: (value: number) => <Tag color="blue">{formatDuration(value)}</Tag>,
    },
    {
      title: 'Sessions',
      dataIndex: 'sessionCount',
      width: 100,
    },
    {
      title: 'First Seen',
      dataIndex: 'firstSeenAt',
      width: 120,
      render: (value?: string) => (value ? dayjs(value).format('h:mm A') : '-'),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeenAt',
      width: 120,
      render: (value?: string) => (value ? dayjs(value).format('h:mm A') : '-'),
    },
    {
      title: 'Nearest',
      dataIndex: 'minDistanceMeters',
      width: 120,
      render: formatDistance,
    },
    {
      title: 'Farthest',
      dataIndex: 'maxDistanceMeters',
      width: 120,
      render: formatDistance,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Employee Site Duration Report</Title>
        <Text type="secondary">Employee x site x location wise time calculation from shift GPS trail.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Total Duration" value={formatDuration(totals.durationMinutes)} prefix={<Timer size={18} />} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Employees" value={totals.employeeCount} prefix={<Users size={18} />} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Sites" value={totals.siteCount} prefix={<MapPinned size={18} />} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Combinations" value={totals.rowCount} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space wrap className="mb-4">
          <RangePicker
            value={range as any}
            onChange={(value) => setRange(value as any)}
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            value={status}
            onChange={setStatus}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
          <Select
            showSearch
            allowClear
            placeholder="Site"
            style={{ width: 260 }}
            value={site}
            onChange={setSite}
            optionFilterProp="label"
            options={siteOptions}
          />
          <Select
            showSearch
            allowClear
            placeholder="Employee"
            style={{ width: 260 }}
            value={employee}
            onChange={setEmployee}
            optionFilterProp="label"
            options={employeeOptions}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredRows}
          rowKey="key"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          summary={(pageData) => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>Page Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Tag color="blue">{formatDuration(pageData.reduce((sum, row: any) => sum + row.durationMinutes, 0))}</Tag>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} colSpan={5} />
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
};

export default ShiftSiteDurationReport;
