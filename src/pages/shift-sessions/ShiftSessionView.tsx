import React, { useMemo, useRef } from 'react';
import {
  Badge,
  Card,
  Collapse,
  Empty,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowLeft, Clock, MapPin, Navigation, Radio, UserCircle2 } from 'lucide-react';
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
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Title level={4} className="!mb-0.5">Shift Session</Title>
          <Text type="secondary" className="text-sm">
            {empName && empName !== '—' ? empName : user?.email ?? '—'} &nbsp;·&nbsp; {dayjs(session.shiftDate).format('DD MMM YYYY')}
          </Text>
        </div>
        <Badge
          status={session.status === 'active' ? 'processing' : 'default'}
          text={
            <span className={`font-semibold text-sm ${session.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {session.status.toUpperCase()}
            </span>
          }
        />
      </div>

      {/* ── Profile + Stats card ── */}
      <Card bodyStyle={{ padding: '20px 24px' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Selfie circle */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {session.selfieUrl ? (
              <img
                src={session.selfieUrl}
                alt="selfie"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 ring-4 ring-gray-200 dark:ring-gray-700 flex items-center justify-center shadow">
                <UserCircle2 size={40} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Selfie</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px self-stretch bg-gray-100 dark:bg-gray-700 mx-2" />

          {/* Stat grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 w-full">
            {/* Employee */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <UserCircle2 size={13} className="text-blue-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Employee</span>
              </div>
              <div className="font-semibold text-sm leading-tight truncate">{empName || '—'}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{emp?.employeeId ?? user?.email ?? '—'}</div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-purple-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Duration</span>
              </div>
              <div className="font-semibold text-sm leading-tight">
                {session.durationMinutes
                  ? formatDuration(session.durationMinutes)
                  : session.status === 'active'
                    ? `${dayjs().diff(dayjs(session.shiftStartedAt), 'minute')}m (live)`
                    : '—'}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {dayjs(session.shiftStartedAt).format('h:mm A')} – {session.shiftEndedAt ? dayjs(session.shiftEndedAt).format('h:mm A') : 'ongoing'}
              </div>
            </div>

            {/* Site */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={13} className="text-green-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Site</span>
              </div>
              <div className="font-semibold text-sm leading-tight truncate">{site?.name ?? '—'}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {[siteLocation?.name, siteLocation?.city || site?.city].filter(Boolean).join(' · ') || site?.code || '—'}
              </div>
            </div>

            {/* Distance + GPS */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Navigation size={13} className="text-orange-500" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Distance / GPS</span>
              </div>
              <div className="font-semibold text-sm leading-tight">
                {(session.totalDistanceMeters / 1000).toFixed(2)} km
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Radio size={11} className="text-pink-500" />
                {trail.length} ping{trail.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Journey Graph ── */}
      <Card
        title={<span className="font-semibold">Journey Timeline</span>}
        extra={<span className="text-xs text-gray-400 dark:text-gray-500">{dayjs(session.shiftDate).format('DD MMM YYYY')} · 24-hour view</span>}
      >
        {journeySegments.length > 0 ? (
          <div className="space-y-4">
            {/* Timeline graph */}
            <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-[1680px]">
                {/* Header */}
                <div className="sticky top-0 z-20 flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 backdrop-blur">
                  <div className="sticky left-0 z-30 w-[200px] shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Site
                  </div>
                  <div className="relative h-10 w-[1480px] shrink-0">
                    {timelineHourLabels.map((hour, index) => (
                      <div
                        key={hour.toISOString()}
                        className="absolute bottom-0 top-0 border-l border-gray-200 dark:border-gray-700 pt-2.5 text-center text-[11px] font-medium text-gray-400 dark:text-gray-500"
                        style={{ left: `${(index / 24) * 100}%`, width: `${100 / 24}%` }}
                      >
                        {hour.format('h A')}
                      </div>
                    ))}
                    <div className="absolute bottom-0 right-0 top-0 border-l border-gray-200 dark:border-gray-700" />
                  </div>
                </div>

                {/* Rows */}
                {journeySiteRows.map((row) => (
                  <div key={row.key} className="flex border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <div className="sticky left-0 z-10 flex h-16 w-[200px] shrink-0 flex-col justify-center gap-0.5 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
                      <div className="font-semibold text-sm truncate leading-tight">{row.siteName}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{row.subText || '—'}</div>
                      <Tag color="geekblue" style={{ marginTop: 2, fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{formatDuration(row.durationMinutes)}</Tag>
                    </div>
                    <div className="relative h-16 w-[1480px] shrink-0" style={{ background: 'var(--ant-color-bg-container, #fff)' }}>
                      {/* Hour grid */}
                      {timelineHours.map((_, index) => (
                        <div
                          key={index}
                          className="absolute bottom-0 top-0 border-l border-dashed border-gray-100 dark:border-gray-800"
                          style={{ left: `${(index / (timelineHours.length - 1)) * 100}%` }}
                        />
                      ))}
                      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                        {journeySegments
                          .filter((seg) => seg.key === row.key)
                          .map((segment, i) => {
                            const x1 = getTimelinePercent(segment.startAt);
                            const x2 = getTimelinePercent(segment.endAt);
                            const y = 30;
                            return (
                              <g key={`${segment.key}-${i}`}>
                                <line x1={`${x1}%`} x2={`${Math.max(x1 + 0.4, x2)}%`} y1={y} y2={y} stroke={row.color} strokeWidth="6" strokeLinecap="round" opacity="0.9">
                                  <title>{`${segment.siteName}\n${dayjs(segment.startAt).format('h:mm A')} – ${dayjs(segment.endAt).format('h:mm A')}\nDuration: ${formatDuration(segment.durationMinutes)}\nGPS Points: ${segment.points}`}</title>
                                </line>
                                <circle cx={`${x1}%`} cy={y} r="4" fill={row.color} />
                                <circle cx={`${Math.max(x1 + 0.4, x2)}%`} cy={y} r="4" fill={row.color} />
                              </g>
                            );
                          })}
                      </svg>
                      {journeySegments
                        .filter((seg) => seg.key === row.key)
                        .map((segment, i) => {
                          const x1 = getTimelinePercent(segment.startAt);
                          const x2 = getTimelinePercent(segment.endAt);
                          return (
                            <div
                              key={`label-${i}`}
                              className="absolute -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-medium shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 whitespace-nowrap"
                              style={{ left: `${(x1 + x2) / 2}%`, top: 40 }}
                            >
                              {dayjs(segment.startAt).format('h:mm A')} – {dayjs(segment.endAt).format('h:mm A')}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary table */}
            <Table
              size="small"
              dataSource={journeySegments}
              rowKey={(row, i) => `${row.key}-${i}`}
              pagination={false}
              columns={[
                {
                  title: 'Site',
                  render: (_: unknown, row: any) => (
                    <div>
                      <div className="font-medium text-sm">{row.siteName}</div>
                      <Text type="secondary" className="text-xs">{row.subText || '—'}</Text>
                    </div>
                  ),
                },
                { title: 'From', dataIndex: 'startAt', render: (v: string) => dayjs(v).format('h:mm A') },
                { title: 'To', dataIndex: 'endAt', render: (v: string) => dayjs(v).format('h:mm A') },
                { title: 'Duration', dataIndex: 'durationMinutes', render: (v: number) => <Tag color="geekblue">{formatDuration(v)}</Tag> },
                { title: 'GPS Points', dataIndex: 'points' },
              ]}
            />
          </div>
        ) : (
          <Empty description="No GPS data matched to any assigned site for this session" />
        )}
      </Card>

      {/* ── GPS Trail accordion ── */}
      <div ref={gpsAccordionRef}>
        <Collapse
          defaultActiveKey={[]}
          onChange={(keys) => {
            if ((keys as string[]).includes('gps-trail')) {
              setTimeout(() => gpsAccordionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
          }}
          items={[{
            key: 'gps-trail',
            label: (
              <span className="font-medium">
                GPS Trail <span className="text-gray-400 dark:text-gray-500 font-normal">({trail.length} points)</span>
              </span>
            ),
            children: (
              <Table
                columns={trailColumns}
                dataSource={trail}
                rowKey={(_, i) => String(i)}
                pagination={{ pageSize: 20, showSizeChanger: true }}
                scroll={{ x: 900 }}
                size="small"
              />
            ),
          }]}
        />
      </div>
    </div>
  );
};

export default ShiftSessionView;
