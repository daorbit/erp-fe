import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Row,
  Col,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Camera, Eye, MapPin, Play, Square, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useActiveShiftSession,
  useEndShiftSession,
  useMyShiftSessions,
  useStartShiftSession,
  useTrackShiftLocation,
} from '@/hooks/queries/useShiftSessions';
import api from '@/services/api';
import { useAppSelector } from '@/store';

const { Title, Text } = Typography;

// 2 minutes in ms — coordinate capture interval.
const TRACK_INTERVAL_MS = 2 * 60 * 1000;

interface Coords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message || 'Unable to fetch location.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

const MyShift: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: activeData, isLoading, refetch } = useActiveShiftSession();
  const { data: historyData, isLoading: historyLoading } = useMyShiftSessions({
    page: 1,
    limit: 50,
  });
  const { data: meData } = useQuery({
    queryKey: ['auth', 'me', 'assigned-sites'],
    queryFn: () => api.get<any>('/auth/me'),
    refetchInterval: TRACK_INTERVAL_MS,
  });
  const startMutation = useStartShiftSession();
  const endMutation = useEndShiftSession();
  const trackMutation = useTrackShiftLocation();

  const activeSession = activeData?.data ?? null;
  const history: any[] = historyData?.data ?? [];
  const userWithSites = meData?.data ?? currentUser;
  const assignedSites = (userWithSites?.allowedBranches ?? [])
    .filter((site: any) => site && typeof site === 'object') as any[];

  // ── Camera state for selfie ──────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // ── Heartbeat tracker for the active session ─────────────────────────────
  const trackTimerRef = useRef<number | null>(null);
  const [lastTrackAt, setLastTrackAt] = useState<Date | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trailCount, setTrailCount] = useState<number>(0);

  // Sync trail count when active session changes (the active query doesn't
  // include the trail, but `track` returns the new count).
  useEffect(() => {
    if (!activeSession?._id) setTrailCount(0);
  }, [activeSession]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (trackTimerRef.current) window.clearInterval(trackTimerRef.current);
    };
  }, []);

  // Start/stop the 2-minute interval based on active session.
  useEffect(() => {
    if (!activeSession?._id) {
      if (trackTimerRef.current) {
        window.clearInterval(trackTimerRef.current);
        trackTimerRef.current = null;
      }
      return;
    }

    const id = activeSession._id;
    const tick = async () => {
      try {
        const coords = await getCurrentPosition();
        const res = await trackMutation.mutateAsync({ id, ...coords });
        setLastTrackAt(new Date());
        setTrackError(null);
        if (res.data?.gpsTrailCount) setTrailCount(res.data.gpsTrailCount);
      } catch (e: any) {
        setTrackError(e?.message || 'Failed to capture location');
      }
    };

    // Run an immediate one then schedule.
    void tick();
    trackTimerRef.current = window.setInterval(tick, TRACK_INTERVAL_MS);

    return () => {
      if (trackTimerRef.current) {
        window.clearInterval(trackTimerRef.current);
        trackTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?._id]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      // Wait for the next render so the <video> element exists.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch (e: any) {
      message.error(e?.message || 'Unable to access camera');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function captureSelfie() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 480;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    if (!blob) {
      message.error('Failed to capture selfie');
      return;
    }
    setSelfieBlob(blob);
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(URL.createObjectURL(blob));
    stopCamera();
  }

  function retakeSelfie() {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfieBlob(null);
    setSelfiePreview(null);
    void startCamera();
  }

  async function handleStart() {
    if (!selfieBlob) {
      message.warning('Please take a selfie before starting your shift.');
      return;
    }
    if (assignedSites.length === 0) {
      message.warning('No site is assigned to your user. Please contact admin.');
      return;
    }
    try {
      const coords = await getCurrentPosition();
      await startMutation.mutateAsync({
        ...coords,
        selfie: selfieBlob,
      });
      message.success('Shift started successfully');
      setSelfieBlob(null);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
      setSelfiePreview(null);
    } catch (e: any) {
      message.error(e?.message || 'Failed to start shift');
    }
  }

  async function handleEnd() {
    if (!activeSession?._id) return;
    try {
      let coords: Coords | undefined;
      try {
        coords = await getCurrentPosition();
      } catch {
        // Allow ending without location if user denies permission.
        coords = undefined;
      }
      await endMutation.mutateAsync({
        id: activeSession._id,
        ...(coords ?? {}),
      });
      message.success('Shift ended successfully');
    } catch (e: any) {
      message.error(e?.message || 'Failed to end shift');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">My Shift</Title>
        <Text type="secondary">Punch in with a selfie. Your location is recorded every 2 minutes while your shift is active.</Text>
      </div>

      {activeSession ? (
        // ─── ACTIVE SHIFT VIEW ───────────────────────────────────────────
        <Card>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} className="flex justify-center">
              {activeSession.selfieUrl ? (
                <img
                  src={activeSession.selfieUrl}
                  alt="Shift selfie"
                  className="w-40 h-40 rounded-2xl object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Camera className="text-gray-400" size={48} />
                </div>
              )}
            </Col>
            <Col xs={24} md={16}>
              <Space direction="vertical" size="middle" className="w-full">
                <Tag color="green" className="text-base px-3 py-1">
                  ACTIVE — Started {dayjs(activeSession.shiftStartedAt).format('h:mm A, DD MMM YYYY')}
                </Tag>
                {activeSession.site && (
                  <Alert
                    type="success"
                    showIcon
                    message={`Working site: ${(activeSession.site as any).name}`}
                  />
                )}
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Elapsed"
                      value={dayjs().diff(dayjs(activeSession.shiftStartedAt), 'minute')}
                      suffix="min"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Distance"
                      value={(activeSession.totalDistanceMeters / 1000).toFixed(2)}
                      suffix="km"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Pings"
                      value={trailCount || 1}
                    />
                  </Col>
                </Row>
                {lastTrackAt && (
                  <Text type="secondary">
                    <MapPin size={14} className="inline mr-1" />
                    Last location captured: {dayjs(lastTrackAt).format('h:mm:ss A')}
                  </Text>
                )}
                {trackError && (
                  <Alert type="warning" showIcon message={trackError} />
                )}
                <Space>
                  <Button
                    danger
                    type="primary"
                    icon={<Square size={16} />}
                    size="large"
                    loading={endMutation.isPending}
                    onClick={handleEnd}
                  >
                    End Shift
                  </Button>
                  <Button
                    icon={<RefreshCw size={16} />}
                    onClick={() => refetch()}
                  >
                    Refresh
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>
      ) : (
        // ─── START NEW SHIFT VIEW ────────────────────────────────────────
        <Card title="Start New Shift">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <Text strong>Step 1 — Take a selfie</Text>
                {!cameraOn && !selfiePreview && (
                  <Button
                    block
                    icon={<Camera size={16} />}
                    onClick={startCamera}
                  >
                    Open Camera
                  </Button>
                )}

                {cameraOn && (
                  <div className="space-y-2">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full max-w-xs rounded-xl border bg-black aspect-square object-cover mx-auto"
                    />
                    <Space className="w-full justify-center">
                      <Button type="primary" onClick={captureSelfie}>
                        Capture
                      </Button>
                      <Button onClick={stopCamera}>Cancel</Button>
                    </Space>
                  </div>
                )}

                {selfiePreview && (
                  <div className="space-y-2">
                    <img
                      src={selfiePreview}
                      alt="Captured selfie"
                      className="w-full max-w-xs rounded-xl mx-auto border"
                    />
                    <div className="text-center">
                      <Button onClick={retakeSelfie}>Retake</Button>
                    </div>
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <Text strong>Step 2 — Allow location & start</Text>
                {assignedSites.length === 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message="No site assigned to your user. Ask admin to assign a site before starting shift."
                  />
                )}
                <Alert
                  type="info"
                  showIcon
                  message="When you tap Start, we capture your current GPS location, then again every 2 minutes until you end the shift."
                />
                <Button
                  block
                  type="primary"
                  size="large"
                  icon={<Play size={16} />}
                  loading={startMutation.isPending}
                  disabled={!selfieBlob || assignedSites.length === 0}
                  onClick={handleStart}
                >
                  Start Shift
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Active session details */}
      {activeSession && (
        <Card title="Shift Details">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            size="small"
          >
            <Descriptions.Item label="Started At">
              {dayjs(activeSession.shiftStartedAt).format('DD MMM YYYY h:mm A')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="green">{activeSession.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Shift">
              {(activeSession.shift as any)?.name ?? 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Working Site">
              {(activeSession.site as any)?.name ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Start Location">
              {activeSession.startLocation
                ? `${activeSession.startLocation.latitude.toFixed(5)}, ${activeSession.startLocation.longitude.toFixed(5)}`
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {!activeSession && !isLoading && (
        <Empty description="No active shift" />
      )}

      {/* ─── My Shift History ────────────────────────────────────────── */}
      <Card title="My Shift History">
        <Table
          loading={historyLoading}
          dataSource={history}
          rowKey="_id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          columns={[
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
              title: 'Site',
              key: 'site',
              render: (_: unknown, r: any) => [r.site?.name, r.siteLocation?.name].filter(Boolean).join(' - ') || '—',
            },
            {
              title: 'Ended',
              dataIndex: 'shiftEndedAt',
              render: (d?: string) => (d ? dayjs(d).format('h:mm A') : '—'),
            },
            {
              title: 'Duration',
              dataIndex: 'durationMinutes',
              render: (m: number | undefined, r: any) => {
                if (m) return `${Math.floor(m / 60)}h ${m % 60}m`;
                if (r.status === 'active') {
                  const mins = dayjs().diff(dayjs(r.shiftStartedAt), 'minute');
                  return `${Math.floor(mins / 60)}h ${mins % 60}m (live)`;
                }
                return '—';
              },
            },
            {
              title: 'Distance',
              dataIndex: 'totalDistanceMeters',
              render: (v: number) => `${(v / 1000).toFixed(2)} km`,
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
                  <img src={u} alt="" className="w-9 h-9 rounded-full object-cover" />
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
          ]}
        />
      </Card>
    </div>
  );
};

export default MyShift;
