import React, { useMemo, useRef } from 'react';
import {
  Card,
  Col,
  Collapse,
  Empty,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowLeft } from 'lucide-react';
import { useShiftSession } from '@/hooks/queries/useShiftSessions';

const { Title, Text } = Typography;

const SITE_COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#c2410c', '#15803d', '#be123c'];

function formatCoords(point?: { latitude: number; longitude: number } | null): string {
  if (!point) return '-';
  return `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
}

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function getTrailSite(point: any) {
  const site = point?.matchedSite;
  const siteLocation = point?.matchedSiteLocation;
  const siteName = siteLocation?.name ?? site?.name;
  if (!siteName) return null;
  return {
    key: `${site?._id ?? 'site'}:${siteLocation?._id ?? 'site-coordinates'}`,
    site,
    siteLocation,
    siteName,
    subText: [site?.name, siteLocation?.city || site?.city].filter(Boolean).join(' · '),
  };
}

const ShiftSessionView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useShiftSession(id);
  const gpsAccordionRef = useRef<HTMLDivElement>(null);
  const session = data?.data;

  const trail = useMemo(() => session?.gpsTrail ?? [], [session]);

  const journeySegments = useMemo(() => {
    if (!session || trail.length === 0) return [];
    const sortedTrail = [...trail].sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
    );
    const segments: Array<{
      key: string;
      siteName: string;
      subText: string;
      startAt: string;
      endAt: string;
      durationMinutes: number;
      points: number;
    }> = [];

    for (let index = 0; index < sortedTrail.length; index += 1) {
      const point: any = sortedTrail[index];
      const siteInfo = getTrailSite(point);
      if (!siteInfo) continue;

      const nextPoint = sortedTrail[index + 1];
      const startAt = point.capturedAt;
      const endAt = nextPoint?.capturedAt ?? session.shiftEndedAt ?? new Date().toISOString();
      const durationMinutes = Math.max(1, dayjs(endAt).diff(dayjs(startAt), 'minute'));
      const last = segments[segments.length - 1];

      if (last && last.key === siteInfo.key) {
        last.endAt = endAt;
        last.durationMinutes += durationMinutes;
        last.points += 1;
      } else {
        segments.push({
          key: siteInfo.key,
          siteName: siteInfo.siteName,
          subText: siteInfo.subText,
          startAt,
          endAt,
          durationMinutes,
          points: 1,
        });
      }
    }

    return segments;
  }, [session, trail]);

  const journeyDayStart = dayjs(session?.shiftDate ?? session?.shiftStartedAt ?? undefined)
    .startOf('day');
  const journeyDayEnd = journeyDayStart.add(1, 'day');
  const totalDayMinutes = journeyDayEnd.diff(journeyDayStart, 'minute');
  const timelineHours = Array.from({ length: 25 }, (_, index) => journeyDayStart.add(index, 'hour'));
  const timelineHourLabels = timelineHours.slice(0, 24);

  const journeySiteRows = useMemo(() => {
    const rows = new Map<string, {
      key: string;
      siteName: string;
      subText: string;
      color: string;
      segments: typeof journeySegments;
      durationMinutes: number;
    }>();

    journeySegments.forEach((segment, index) => {
      const existing = rows.get(segment.key);
      if (existing) {
        existing.segments.push(segment);
        existing.durationMinutes += segment.durationMinutes;
        return;
      }

      rows.set(segment.key, {
        key: segment.key,
        siteName: segment.siteName,
        subText: segment.subText,
        color: SITE_COLORS[index % SITE_COLORS.length],
        segments: [segment],
        durationMinutes: segment.durationMinutes,
      });
    });

    return Array.from(rows.values());
  }, [journeySegments]);

  const getTimelinePercent = (value: string): number => {
    const minutes = dayjs(value).diff(journeyDayStart, 'minute');
    const clamped = Math.min(totalDayMinutes, Math.max(0, minutes));
    return (clamped / totalDayMinutes) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (!session) {
    return <Empty description="Shift session not found" />;
  }

  const emp: any = session.employee;
  const user: any = emp?.userId;
  const site: any = session.site;
  const siteLocation: any = session.siteLocation;
  const empName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
  const latestPoint = session.latestLocation ?? trail[trail.length - 1] ?? null;
  const siteGeo = siteLocation ?? site;
  const siteCoords = typeof siteGeo?.latitude === 'number' && typeof siteGeo?.longitude === 'number'
    ? { latitude: siteGeo.latitude, longitude: siteGeo.longitude }
    : null;
  const trailColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
    },
    {
      title: 'Captured At',
      dataIndex: 'capturedAt',
      render: (d: string) => dayjs(d).format('DD MMM YYYY h:mm:ss A'),
    },
    {
      title: 'Latitude',
      dataIndex: 'latitude',
      render: (v: number) => v.toFixed(6),
    },
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      render: (v: number) => v.toFixed(6),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      render: (v?: number) => (v ? `±${Math.round(v)} m` : '—'),
    },
    {
      title: 'Present Site',
      key: 'matchedSite',
      render: (_: unknown, p: any) => {
        const siteName = p.matchedSiteLocation?.name ?? p.matchedSite?.name;
        const subText = [p.matchedSite?.name, p.matchedSiteLocation?.city || p.matchedSite?.city]
          .filter(Boolean)
          .join(' · ');
        return siteName ? (
          <div>
            <div className="font-medium">{siteName}</div>
            <Text type="secondary" className="text-xs">{subText}</Text>
          </div>
        ) : '-';
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-1"
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </button>
          <Title level={4} className="!mb-1">Shift Session</Title>
          <Text type="secondary">{empName} · {dayjs(session.shiftDate).format('DD MMM YYYY')}</Text>
        </div>
        <Tag color={session.status === 'active' ? 'green' : 'blue'} className="text-base px-3 py-1">
          {session.status.toUpperCase()}
        </Tag>
      </div>

      <Row gutter={[16, 16]} align="top">
        <Col xs={24} sm={8} md={5} lg={4}>
          <Card title="Selfie" bodyStyle={{ padding: 10 }}>
            {session.selfieUrl ? (
              <img
                src={session.selfieUrl}
                alt="Shift selfie"
                className="aspect-square w-full rounded-lg object-cover block"
              />
            ) : (
              <Empty description="No selfie" />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={16} md={19} lg={20}>
          <Card title="Journey Graph">
            {journeySegments.length > 0 ? (
              <div className="space-y-3">
            <div className="overflow-auto rounded-md border bg-white">
              <div className="w-[1680px]">
                <div className="sticky top-0 z-20 flex border-b bg-gray-50">
                  <div className="sticky left-0 z-30 w-[200px] shrink-0 border-r bg-gray-50 px-3 py-3 text-xs font-semibold uppercase text-gray-500">
                    Site
                  </div>
                  <div className="relative h-11 w-[1480px] shrink-0">
                    {timelineHourLabels.map((hour, index) => (
                      <div
                        key={hour.toISOString()}
                        className="absolute bottom-0 top-0 border-l border-gray-200 px-2 pt-3 text-center text-[11px] font-medium text-gray-500"
                        style={{ left: `${(index / 24) * 100}%`, width: `${100 / 24}%` }}
                      >
                        {hour.format('h A')}
                      </div>
                    ))}
                    <div className="absolute bottom-0 right-0 top-0 border-l border-gray-200" />
                  </div>
                </div>

                {journeySiteRows.map((row) => (
                  <div key={row.key} className="flex border-b last:border-b-0">
                    <div className="sticky left-0 z-10 flex h-[72px] w-[200px] shrink-0 flex-col justify-center border-r bg-white px-3">
                      <div className="font-medium text-sm truncate">{row.siteName}</div>
                      <div className="text-xs text-gray-500 truncate">{row.subText || '-'}</div>
                    </div>
                    <div className="relative h-[72px] w-[1480px] shrink-0 bg-gray-50">
                      {timelineHours.map((hour, index) => (
                        <div
                          key={hour.toISOString()}
                          className="absolute bottom-0 top-0 border-l border-dashed border-gray-200"
                          style={{ left: `${(index / (timelineHours.length - 1)) * 100}%` }}
                        />
                      ))}
                      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                        {journeySegments
                          .filter((seg) => seg.key === row.key)
                          .map((segment, index) => {
                            const x1 = getTimelinePercent(segment.startAt);
                            const x2 = getTimelinePercent(segment.endAt);
                            const y = 32;
                            return (
                              <g key={`${segment.key}-${segment.startAt}-${index}`}>
                                <line x1={`${x1}%`} x2={`${Math.max(x1 + 0.5, x2)}%`} y1={y} y2={y} stroke={row.color} strokeWidth="8" strokeLinecap="round">
                                  <title>{`${segment.siteName}\n${dayjs(segment.startAt).format('h:mm A')} - ${dayjs(segment.endAt).format('h:mm A')}\nDuration: ${formatDuration(segment.durationMinutes)}\nGPS Points: ${segment.points}`}</title>
                                </line>
                                <circle cx={`${x1}%`} cy={y} r="5" fill={row.color}>
                                  <title>{`${segment.siteName} start: ${dayjs(segment.startAt).format('h:mm A')}`}</title>
                                </circle>
                                <circle cx={`${Math.max(x1 + 0.5, x2)}%`} cy={y} r="5" fill={row.color}>
                                  <title>{`${segment.siteName} end: ${dayjs(segment.endAt).format('h:mm A')}`}</title>
                                </circle>
                              </g>
                            );
                          })}
                      </svg>
                      {journeySegments
                        .filter((seg) => seg.key === row.key)
                        .map((segment, index) => {
                          const x1 = getTimelinePercent(segment.startAt);
                          const x2 = getTimelinePercent(segment.endAt);
                          const left = (x1 + x2) / 2;
                          return (
                            <div
                              key={`${segment.key}-${segment.startAt}-${index}-label`}
                              className="absolute -translate-x-1/2 rounded bg-white/95 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm border"
                              style={{ left: `${left}%`, top: 42 }}
                              title={`${segment.siteName}\n${dayjs(segment.startAt).format('h:mm A')} - ${dayjs(segment.endAt).format('h:mm A')}`}
                            >
                              {dayjs(segment.startAt).format('h:mm A')} - {dayjs(segment.endAt).format('h:mm A')}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              {dayjs(session.shiftDate).format('DD MMM YYYY')} full 24-hour line graph. Hover a line to view timing details.
            </div>

            <Table
              size="small"
              dataSource={journeySegments}
              rowKey={(row, index) => `${row.key}-${row.startAt}-${index}`}
              pagination={false}
              columns={[
                {
                  title: 'Site',
                  render: (_: unknown, row: any) => (
                    <div>
                      <div className="font-medium">{row.siteName}</div>
                      <Text type="secondary" className="text-xs">{row.subText || '-'}</Text>
                    </div>
                  ),
                },
                { title: 'From', dataIndex: 'startAt', render: (value: string) => dayjs(value).format('h:mm A') },
                { title: 'To', dataIndex: 'endAt', render: (value: string) => dayjs(value).format('h:mm A') },
                { title: 'Duration', dataIndex: 'durationMinutes', render: (value: number) => <Tag color="blue">{formatDuration(value)}</Tag> },
                { title: 'GPS Points', dataIndex: 'points' },
              ]}
            />
              </div>
            ) : (
              <Empty description="No assigned site matched for this session" />
            )}
          </Card>
        </Col>
      </Row>

      <div ref={gpsAccordionRef}>
        <Collapse
          style={{ background: '#ffffff', borderRadius: 8 }}
          defaultActiveKey={[]}
          onChange={(keys) => {
            if ((keys as string[]).includes('gps-trail')) {
              setTimeout(() => gpsAccordionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
          }}
          items={[{
            key: 'gps-trail',
            label: `GPS Trail (${trail.length} points)`,
            children: (
              <Table
                columns={trailColumns}
                dataSource={trail}
                rowKey={(_, i) => String(i)}
                pagination={{ pageSize: 20, showSizeChanger: true }}
                scroll={{ x: 900 }}
              />
            ),
          }]}
        />
      </div>
    </div>
  );
};

export default ShiftSessionView;
