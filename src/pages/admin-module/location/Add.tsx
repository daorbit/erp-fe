import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Form, Input, Tabs, Button, Select, InputNumber, Table, Typography, App,
} from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { List as ListIcon, MapPin } from 'lucide-react';
import { useCreateLocation, useUpdateLocation, useLocation } from '@/hooks/queries/useLocations';
import { cityHooks } from '@/hooks/queries/useMasterOther';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const LOCATION_TYPE_OPTIONS = [
  { value: 'Store Location', label: 'Store Location' },
  { value: 'Quarry', label: 'Quarry' },
  { value: 'Road Location', label: 'Road Location' },
  { value: 'Pile Location', label: 'Pile Location' },
];

function FRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">{children}</div>;
}

function FItem({
  label, name, children, required,
}: { label: string; name: string; children?: React.ReactNode; required?: boolean }) {
  return (
    <Form.Item
      label={label}
      name={name}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 15 }}
      rules={required ? [{ required: true, message: `${label} is required` }] : undefined}
    >
      {children || <Input />}
    </Form.Item>
  );
}

export default function LocationAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [routeKmMap, setRouteKmMap] = useState<Record<string, number>>({});
  const [previewCoords, setPreviewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const isEdit = !!id;
  const [searchParams] = useSearchParams();
  const prefilledSiteId = searchParams.get('site');

  const { data: locationData, isLoading } = useLocation(id || '');
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  const { data: citiesData } = cityHooks.useList();
  const cityOptions = (citiesData?.data ?? []).map((c: any) => ({ value: c.name, label: c.name }));

  // Load all branches for the Site Name dropdown
  const { data: branchesData } = useQuery({
    queryKey: ['branches-all'],
    queryFn: () => api.get('/branches', { limit: '500' }),
  });
  const branches: any[] = ((branchesData as any)?.data ?? []) as any[];
  const siteOptions = branches.map((b: any) => ({
    value: b._id || b.id,
    label: `${b.name} (${b.code || ''})`,
  }));

  // All existing locations populate the Route Detail matrix (one row each,
  // excluding the location being edited).
  const { data: allLocationsData } = useQuery({
    queryKey: ['site-locations-min'],
    queryFn: () => api.get('/locations', { limit: '500' }),
  });
  const allLocations: any[] = ((allLocationsData as any)?.data ?? []) as any[];

  const branchById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const b of branches) map[b._id || b.id] = b;
    return map;
  }, [branches]);

  const routeTargets = useMemo(() => {
    return allLocations
      .filter((loc) => !isEdit || (loc._id !== id))
      .map((loc) => {
        const siteId = typeof loc.site === 'object' ? loc.site?._id : loc.site;
        const site = branchById[siteId];
        return {
          locationId: loc._id,
          toLocation: (loc.name || '').toUpperCase(),
          siteName: site?.name || '',
        };
      });
  }, [allLocations, branchById, isEdit, id]);

  useEffect(() => {
    if (!isEdit && prefilledSiteId) {
      form.setFieldsValue({ site: prefilledSiteId });
    }
  }, [prefilledSiteId, isEdit, form]);

  useEffect(() => {
    if (isEdit && locationData?.data) {
      const loc = locationData.data;
      form.setFieldsValue({
        name: loc.name,
        site: typeof loc.site === 'object' ? (loc.site._id || loc.site.id) : loc.site,
        contactPerson1: loc.contactPerson1,
        contactPerson2: loc.contactPerson2,
        storeManager: loc.storeManager,
        address1: loc.address1,
        address2: loc.address2,
        address3: loc.address3,
        locationType: loc.locationType,
        orderNo: loc.orderNo ?? 0,
        city: loc.city,
        pinCode: loc.pinCode,
        routeDetails: loc.routeDetails || [],
        latitude: loc.latitude,
        longitude: loc.longitude,
        approxLocationKm: loc.approxLocationKm,
      });
      if (loc.latitude != null && loc.longitude != null) {
        setPreviewCoords({ lat: loc.latitude, lng: loc.longitude });
      }
      // Seed the routeKmMap from existing routeDetails entries.
      const seed: Record<string, number> = {};
      for (const r of loc.routeDetails || []) {
        if (r?.toLocation) seed[r.toLocation] = Number(r.km ?? r.distance ?? 0);
      }
      setRouteKmMap(seed);
    }
  }, [locationData, form, isEdit]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      // Build routeDetails from the matrix: one entry per target location with km > 0.
      const routeDetails = Object.entries(routeKmMap)
        .filter(([, km]) => km > 0)
        .map(([toLocation, km]) => ({ toLocation, km }));
      const payload = { ...values, routeDetails };
      // Strip null coordinates (empty InputNumber) — don't send null to the server
      if (payload.latitude == null) delete payload.latitude;
      if (payload.longitude == null) delete payload.longitude;
      if (payload.approxLocationKm == null) delete payload.approxLocationKm;
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
        message.success('Location updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Location created');
      }
      navigate('/admin-module/master/site-location/list');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ─── Tab 1: Location Detail ───────────────────────────────────────────────
  function handleCoordsChange() {
    const lat = form.getFieldValue('latitude');
    const lng = form.getFieldValue('longitude');
    if (lat != null && lng != null) setPreviewCoords({ lat, lng });
    else setPreviewCoords(null);
  }

  function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
    // Handles full Google Maps URLs: .../@lat,lng,zoom... or .../@lat,lng,...
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    // Handles short ?q=lat,lng or ll=lat,lng params
    const qMatch = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    return null;
  }

  function handleMapLinkPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    const coords = parseGoogleMapsUrl(text);
    if (coords) {
      form.setFieldsValue({ latitude: coords.lat, longitude: coords.lng });
      setPreviewCoords(coords);
      message.success(`Coordinates extracted: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      // Clear the input field after extraction
      setTimeout(() => (e.target as HTMLInputElement).value = '', 0);
      e.preventDefault();
    }
  }

  function detectMyLocation() {
    if (!('geolocation' in navigator)) {
      message.error('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setFieldsValue({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setPreviewCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => message.error(err.message || 'Unable to fetch location.'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  const locationDetailTab = (
    <div className="py-4">
      <FRow>
        <FItem label="Location Name" name="name" required><Input /></FItem>
        <FItem label="Site Name" name="site" required>
          <Select
            options={siteOptions}
            showSearch
            optionFilterProp="label"
            placeholder="Select site"
            allowClear
          />
        </FItem>
      </FRow>
      <FRow>
        <FItem label="Contact Person 1" name="contactPerson1"><Input /></FItem>
        <FItem label="Contact Person 2" name="contactPerson2"><Input /></FItem>
      </FRow>
      <FRow>
        <FItem label="Store Manager" name="storeManager"><Input /></FItem>
        <div />
      </FRow>
      <FRow>
        <FItem label="Address 1" name="address1">
          <TextArea rows={2} maxLength={100} showCount />
        </FItem>
        <FItem label="Address 2" name="address2">
          <TextArea rows={2} maxLength={100} showCount />
        </FItem>
      </FRow>
      <FRow>
        <FItem label="Address 3" name="address3">
          <TextArea rows={2} maxLength={100} showCount />
        </FItem>
        <div className="grid grid-cols-1 gap-y-1">
          <FItem label="Location Type" name="locationType" required>
            <Select options={LOCATION_TYPE_OPTIONS} placeholder="Please Select" allowClear />
          </FItem>
          <FItem label="Order No." name="orderNo">
            <InputNumber min={0} className="w-full" />
          </FItem>
        </div>
      </FRow>
      <FRow>
        <FItem label="City" name="city" required>
          <Select
            options={cityOptions}
            showSearch
            optionFilterProp="label"
            placeholder="Select city"
            allowClear
          />
        </FItem>
        <FItem label="PIN Code" name="pinCode"><Input /></FItem>
      </FRow>

      {/* ─── Site Location (GPS) ──────────────────────────────────────────── */}
      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <MapPin size={16} className="text-blue-500" />
              Site Location
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              GPS pin and allowed buffer used for shift distance checks.
            </div>
          </div>
          <Button size="small" icon={<MapPin size={13} />} onClick={detectMyLocation}>
            Use current GPS
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <div className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Google Maps Link</div>
            <Input
              placeholder="Paste Google Maps URL to auto-fill latitude and longitude"
              onPaste={handleMapLinkPaste}
              allowClear
              prefix={<MapPin size={13} className="text-slate-400" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Form.Item label="Latitude" name="latitude" className="!mb-0">
              <InputNumber
                placeholder="28.613900"
                className="w-full"
                precision={6}
                min={-90}
                max={90}
                onChange={handleCoordsChange}
              />
            </Form.Item>
            <Form.Item label="Longitude" name="longitude" className="!mb-0">
              <InputNumber
                placeholder="77.209000"
                className="w-full"
                precision={6}
                min={-180}
                max={180}
                onChange={handleCoordsChange}
              />
            </Form.Item>
            <Form.Item
              label="Allowed Buffer (KM)"
              name="approxLocationKm"
              className="!mb-0"
              tooltip="Admin tracking marks the user inside this radius from the site location."
            >
              <InputNumber
                placeholder="1.50"
                className="w-full"
                min={0}
                step={0.1}
                precision={2}
                addonAfter="km"
              />
            </Form.Item>
          </div>

        {previewCoords ? (
          <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
            <iframe
              title="Location map"
              width="100%"
              height="260"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${previewCoords.lng - 0.01},${previewCoords.lat - 0.01},${previewCoords.lng + 0.01},${previewCoords.lat + 0.01}&layer=mapnik&marker=${previewCoords.lat},${previewCoords.lng}`}
              style={{ border: 0 }}
            />
            <div className="flex flex-col gap-2 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium"><MapPin size={12} className="inline mr-1" />{previewCoords.lat.toFixed(6)}, {previewCoords.lng.toFixed(6)}</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${previewCoords.lat}&mlon=${previewCoords.lng}&zoom=15`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open in map ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[132px] flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm dark:bg-slate-900">
              <MapPin size={17} />
            </div>
            <div className="font-medium text-slate-600 dark:text-slate-300">No map pin selected</div>
            <div className="mt-1">Paste a map link, enter coordinates, or use current GPS.</div>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  // ─── Tab 2: Route Detail ──────────────────────────────────────────────────
  // Auto-populated grid: one row per existing location, with a KM input.
  const routeDetailTab = (
    <div className="py-4">
      <Table
        dataSource={routeTargets}
        pagination={false}
        size="small"
        rowKey="locationId"
        bordered
        columns={[
          {
            title: 'SrNo.', key: 'sr', width: 80,
            render: (_, __, i) => i + 1,
          },
          {
            title: 'To Location', dataIndex: 'toLocation', key: 'toLocation', width: 280,
          },
          {
            title: 'Site Name', dataIndex: 'siteName', key: 'siteName',
          },
          {
            title: 'KM.', key: 'km', width: 200,
            render: (_, row) => (
              <InputNumber
                size="small"
                min={0}
                step={0.01}
                value={routeKmMap[row.locationId] ?? 0}
                onChange={(v) =>
                  setRouteKmMap((p) => ({ ...p, [row.locationId]: Number(v) || 0 }))
                }
                style={{ width: '100%' }}
              />
            ),
          },
        ]}
        locale={{ emptyText: 'No other locations to route to' }}
      />
    </div>
  );

  const tabItems = [
    { key: 'detail', label: 'Location - Detail', children: locationDetailTab },
    { key: 'route', label: 'Route Detail', children: routeDetailTab },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Location</Title>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/admin-module/master/site-location/list')}
        >
          List
        </Button>
      </div>

      <Text type="danger" className="block text-center font-medium">
        {isEdit ? 'Edit Mode' : 'New Mode'}
      </Text>

      <Card bordered={false} className="!rounded-lg !shadow-sm" loading={isEdit && isLoading}>
        <Form form={form} layout="horizontal" size="small" initialValues={{ orderNo: 0 }}>
          <Tabs items={tabItems} type="card" />

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/site-location/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
