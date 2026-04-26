import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Form, Input, Tabs, Button, Select, InputNumber, Table, Typography, App,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon } from 'lucide-react';
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
  const isEdit = !!id;

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
      });
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
