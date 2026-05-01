import React, { useEffect, useMemo, useRef } from 'react';
import {
  Card,
  Col,
  Descriptions,
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { useShiftSession } from '@/hooks/queries/useShiftSessions';

const { Title, Text } = Typography;

// Inline SVG marker — avoids asset-bundler issues with leaflet's PNG defaults.
function makeNumberedIcon(label: string, color: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 27 15 27s15-15.8 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="9" fill="white"/>
      <text x="15" y="19" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'shift-trail-marker',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

const startIcon = makeNumberedIcon('S', '#10b981');
const endIcon = makeNumberedIcon('E', '#ef4444');
const siteIcon = makeNumberedIcon('SITE', '#f59e0b');
const midIconCache = new Map<number, L.DivIcon>();
function midIcon(n: number) {
  const cached = midIconCache.get(n);
  if (cached) return cached;
  const ic = makeNumberedIcon(String(n), '#3b82f6');
  midIconCache.set(n, ic);
  return ic;
}

function formatCoords(point?: { latitude: number; longitude: number } | null): string {
  if (!point) return '-';
  return `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
}

const ShiftSessionView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useShiftSession(id);
  const session = data?.data;
  const mapRef = useRef<L.Map | null>(null);

  const trail = session?.gpsTrail ?? [];
  const positions = useMemo<[number, number][]>(
    () => trail.map((p) => [p.latitude, p.longitude]),
    [trail],
  );
  const sitePosition = useMemo<[number, number] | null>(() => {
    const geo: any = session?.siteLocation ?? session?.site;
    if (typeof geo?.latitude !== 'number' || typeof geo?.longitude !== 'number') return null;
    return [geo.latitude, geo.longitude];
  }, [session?.site, session?.siteLocation]);

  // Tell Leaflet to recalculate size + fit bounds once data + container exist.
  useEffect(() => {
    if (!mapRef.current || positions.length === 0) return;
    const map = mapRef.current;
    const t = setTimeout(() => {
      map.invalidateSize();
      if (positions.length > 1) {
        map.fitBounds(positions as L.LatLngBoundsLiteral, { padding: [40, 40] });
      } else {
        map.setView(positions[0], 16);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [positions]);

  const center: [number, number] = positions[0] ??
    (session?.startLocation
      ? [session.startLocation.latitude, session.startLocation.longitude]
      : [20.5937, 78.9629]); // India fallback

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
        ) : 'Outside assigned site';
      },
    },
  ];

  return (
    <div className="space-y-6">
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

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Selfie">
            {session.selfieUrl ? (
              <img
                src={session.selfieUrl}
                alt="Shift selfie"
                className="w-full rounded-xl object-cover"
              />
            ) : (
              <Empty description="No selfie" />
            )}
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Summary">
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Employee">{empName}</Descriptions.Item>
              <Descriptions.Item label="Employee ID">{emp?.employeeId ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{user?.phone ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Working Site">{site?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Site Location">{siteLocation?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Site Coordinates">{formatCoords(siteCoords)}</Descriptions.Item>
              <Descriptions.Item label="Current GPS">{formatCoords(latestPoint)}</Descriptions.Item>
              <Descriptions.Item label="Location Address">
                {siteLocation || site
                  ? [siteLocation?.address1, siteLocation?.address2, siteLocation?.city || site?.city, site?.stateName, siteLocation?.pinCode || site?.pincode].filter(Boolean).join(', ') || '—'
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Started">{dayjs(session.shiftStartedAt).format('DD MMM YYYY h:mm A')}</Descriptions.Item>
              <Descriptions.Item label="Ended">
                {session.shiftEndedAt ? dayjs(session.shiftEndedAt).format('DD MMM YYYY h:mm A') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {session.durationMinutes
                  ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                  : (session.status === 'active'
                      ? `${dayjs().diff(dayjs(session.shiftStartedAt), 'minute')} min (ongoing)`
                      : '—')}
              </Descriptions.Item>
              <Descriptions.Item label="Distance">
                {(session.totalDistanceMeters / 1000).toFixed(2)} km
              </Descriptions.Item>
              <Descriptions.Item label="GPS Pings">{trail.length}</Descriptions.Item>
              <Descriptions.Item label="Shift">{(session.shift as any)?.name ?? '—'}</Descriptions.Item>
              {session.notes && (
                <Descriptions.Item label="Notes" span={2}>{session.notes}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title={`Journey Map (${trail.length} points)`} bodyStyle={{ padding: 0 }}>
        {positions.length > 0 ? (
          <MapContainer
            center={center}
            zoom={positions.length > 1 ? 14 : 16}
            style={{ height: 460, width: '100%' }}
            scrollWheelZoom
            doubleClickZoom
            touchZoom
            dragging
            zoomControl
            ref={(m) => { mapRef.current = m; }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {positions.length > 1 && (
              <Polyline positions={positions} pathOptions={{ color: '#3b82f6', weight: 4 }} />
            )}
            {sitePosition && (
              <>
              <Marker position={sitePosition} icon={siteIcon}>
                <Popup>
                  <div className="text-xs">
                    <div><strong>{siteLocation?.name ?? site?.name ?? 'Assigned Site'}</strong></div>
                    <div>{sitePosition[0].toFixed(5)}, {sitePosition[1].toFixed(5)}</div>
                    <div>{[siteLocation?.city || site?.city, site?.stateName].filter(Boolean).join(', ')}</div>
                  </div>
                </Popup>
              </Marker>
              </>
            )}
            {trail.map((p, i) => {
              const isStart = i === 0;
              const isEnd = i === trail.length - 1 && trail.length > 1;
              const icon = isStart ? startIcon : isEnd ? endIcon : midIcon(i + 1);
              return (
                <Marker key={i} position={[p.latitude, p.longitude]} icon={icon}>
                  <Popup>
                    <div className="text-xs">
                      <div><strong>{isStart ? 'Start' : isEnd ? 'End' : `Point #${i + 1}`}</strong></div>
                      <div>{dayjs(p.capturedAt).format('DD MMM, h:mm:ss A')}</div>
                      {(p as any).matchedSiteLocation?.name || (p as any).matchedSite?.name ? (
                        <div>Present site: {(p as any).matchedSiteLocation?.name ?? (p as any).matchedSite?.name}</div>
                      ) : null}
                      <div>{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</div>
                      {p.accuracy ? <div>±{Math.round(p.accuracy)} m</div> : null}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="p-10">
            <Empty description="No GPS points recorded" />
          </div>
        )}
      </Card>

      <Card title="GPS Trail">
        <Table
          columns={trailColumns}
          dataSource={trail}
          rowKey={(_, i) => String(i)}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default ShiftSessionView;
