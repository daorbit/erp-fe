import React, { useMemo, useState } from 'react';
import { Card, Col, DatePicker, Empty, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { MapPinned, Timer, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useEmployeeJourneyReport, useShiftSiteDurationReport } from '@/hooks/queries/useShiftSessions';
import type { EmployeeJourneySegment, SiteDurationReportRow } from '@/services/shiftSessionService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const SITE_COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#4f46e5', '#65a30d'];

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
  const [journeyEmployee, setJourneyEmployee] = useState<string | undefined>();
  const [journeyDate, setJourneyDate] = useState(dayjs());
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

  const { data: employeeData } = useQuery({
    queryKey: ['employees', 'journey-report-filter'],
    queryFn: () => api.get<any[]>('/employees', { limit: '500' }),
  });
  const allEmployeeOptions = (employeeData?.data ?? []).map((item: any) => ({
    value: item._id,
    label: [
      [item.userId?.firstName, item.userId?.lastName].filter(Boolean).join(' ').trim(),
      item.employeeId,
    ].filter(Boolean).join(' - '),
  }));

  const journeyParams = {
    employee: journeyEmployee,
    date: journeyDate.format('YYYY-MM-DD'),
  };
  const { data: journeyData, isLoading: journeyLoading } = useEmployeeJourneyReport(journeyParams);
  const journey = journeyData?.data;
  const journeySegments = journey?.segments ?? [];

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

  const journeyEmployeeOptions = allEmployeeOptions.length > 0 ? allEmployeeOptions : employeeOptions;

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

  const dayStart = journeyDate.startOf('day');
  const totalDayMinutes = 24 * 60;
  const siteColorMap = useMemo(() => {
    const map = new Map<string, string>();
    journeySegments.forEach((segment, index) => {
      if (!map.has(segment.siteKey)) {
        map.set(segment.siteKey, SITE_COLORS[index % SITE_COLORS.length]);
      }
    });
    return map;
  }, [journeySegments]);

  const getSegmentStyle = (segment: EmployeeJourneySegment) => {
    const startMinutes = Math.max(0, dayjs(segment.startAt).diff(dayStart, 'minute'));
    const endMinutes = Math.min(totalDayMinutes, dayjs(segment.endAt).diff(dayStart, 'minute'));
    const left = (startMinutes / totalDayMinutes) * 100;
    const width = Math.max(((endMinutes - startMinutes) / totalDayMinutes) * 100, 0.8);
    return {
      left: `${left}%`,
      width: `${width}%`,
      background: siteColorMap.get(segment.siteKey) ?? SITE_COLORS[0],
    };
  };

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
        <div className="mb-4">
          <Title level={5} className="!mb-1">Day Journey Graph</Title>
          <Text type="secondary">Select one employee and one day to see site-wise presence timeline.</Text>
        </div>

        <Space wrap className="mb-5">
          <DatePicker
            value={journeyDate}
            onChange={(value) => setJourneyDate(value ?? dayjs())}
            allowClear={false}
          />
          <Select
            showSearch
            allowClear
            placeholder="Employee"
            style={{ width: 320 }}
            value={journeyEmployee}
            onChange={setJourneyEmployee}
            optionFilterProp="label"
            options={journeyEmployeeOptions}
          />
        </Space>

        {!journeyEmployee ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select employee to view journey graph" />
        ) : journeyLoading ? (
          <div className="h-28 rounded border border-dashed flex items-center justify-center text-gray-500">Loading journey...</div>
        ) : journeySegments.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assigned-site presence found for selected day" />
        ) : (
          <div className="space-y-5">
            <div className="relative h-20 rounded border bg-gray-50 overflow-hidden">
              <div className="absolute inset-x-0 top-2 flex justify-between px-3 text-[11px] text-gray-500">
                <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
              </div>
              <div className="absolute left-3 right-3 top-9 h-7 rounded bg-white border">
                {journeySegments.map((segment, index) => (
                  <div
                    key={`${segment.siteKey}-${segment.startAt}-${index}`}
                    className="absolute top-0 h-full rounded-sm text-white text-[11px] leading-7 px-2 overflow-hidden whitespace-nowrap"
                    style={getSegmentStyle(segment)}
                    title={`${segment.siteName || 'Site'} ${dayjs(segment.startAt).format('h:mm A')} - ${dayjs(segment.endAt).format('h:mm A')}`}
                  >
                    {segment.siteName}
                  </div>
                ))}
              </div>
            </div>

            <Row gutter={[12, 12]}>
              {(journey?.siteTotals ?? []).map((item: any, index: number) => (
                <Col xs={24} md={8} key={`${item.site?._id ?? index}-${item.siteLocation?._id ?? 'site'}`}>
                  <div className="rounded border p-3 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm" style={{ background: SITE_COLORS[index % SITE_COLORS.length] }} />
                      <Text strong>{item.siteName || '-'}</Text>
                    </div>
                    <Text type="secondary" className="block text-xs mt-1">
                      {[item.siteLocationName, item.siteCode].filter(Boolean).join(' - ') || '-'}
                    </Text>
                    <Tag color="blue" className="mt-2">{formatDuration(item.durationMinutes)}</Tag>
                  </div>
                </Col>
              ))}
            </Row>

            <Table
              size="small"
              rowKey={(row: EmployeeJourneySegment, index) => `${row.siteKey}-${row.startAt}-${index}`}
              dataSource={journeySegments}
              pagination={false}
              columns={[
                { title: 'Site', render: (_: unknown, row: EmployeeJourneySegment) => row.siteName || '-' },
                { title: 'Site Location', render: (_: unknown, row: EmployeeJourneySegment) => row.siteLocationName || '-' },
                { title: 'From', dataIndex: 'startAt', render: (value: string) => dayjs(value).format('h:mm A') },
                { title: 'To', dataIndex: 'endAt', render: (value: string) => dayjs(value).format('h:mm A') },
                { title: 'Present Time', dataIndex: 'durationMinutes', render: (value: number) => <Tag color="blue">{formatDuration(value)}</Tag> },
              ]}
            />
          </div>
        )}
      </Card>

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
