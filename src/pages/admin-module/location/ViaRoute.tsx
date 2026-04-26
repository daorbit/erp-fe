import React, { useMemo, useState } from 'react';
import { Card, Button, Typography, Form, Select, Input, InputNumber, Table, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { List as ListIcon } from 'lucide-react';
import api from '@/services/api';

const { Title, Text } = Typography;

type RouteRow = { key: string; routeName: string; chainagePoint: number; distance: number };

export default function ViaRoute() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [fromLocation, setFromLocation] = useState<string | undefined>();
  const [toLocation, setToLocation] = useState<string | undefined>();
  const [rows, setRows] = useState<RouteRow[]>([
    { key: '1', routeName: '', chainagePoint: 0, distance: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  // Pull all locations (each location belongs to a branch / site).
  const { data: locationsData } = useQuery({
    queryKey: ['site-locations-min'],
    queryFn: () => api.get('/locations', { limit: '500' }),
  });
  const { data: branchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
    staleTime: 5 * 60 * 1000,
  });

  const locations: any[] = (locationsData?.data ?? []) as any[];
  const branches: any[] = (branchesData?.data ?? []) as any[];

  // Build options: "<LOC NAME> (<SITE CODE>) || <serial>"
  const locationOptions = useMemo(() => {
    return locations.map((loc, idx) => {
      const siteId = typeof loc.site === 'object' ? loc.site?._id : loc.site;
      const site = branches.find((b) => b._id === siteId);
      const code = site?.code ? ` (${site.code})` : '';
      return {
        value: loc._id,
        label: `${(loc.name || '').toUpperCase()}${code} || ${idx + 1}`,
        searchText: `${loc.name || ''} ${site?.code || ''}`.toLowerCase(),
      };
    });
  }, [locations, branches]);

  const addRow = () => {
    setRows((p) => [...p, { key: String(p.length + 1), routeName: '', chainagePoint: 0, distance: 0 }]);
  };
  const removeRow = (key: string) => {
    setRows((p) => (p.length > 1 ? p.filter((r) => r.key !== key) : p));
  };
  const updateRow = (key: string, patch: Partial<RouteRow>) => {
    setRows((p) => p.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleSave = async () => {
    if (!fromLocation || !toLocation) {
      message.error('From Location and To Location are required.');
      return;
    }
    if (fromLocation === toLocation) {
      message.error('From and To Location cannot be the same.');
      return;
    }
    const validRows = rows.filter((r) => r.routeName.trim());
    if (validRows.length === 0) {
      message.error('Add at least one route entry with a name.');
      return;
    }
    try {
      setSaving(true);
      await api.post('/locations/via-routes', {
        fromLocation,
        toLocation,
        routes: validRows.map(({ routeName, chainagePoint, distance }) => ({
          routeName, chainagePoint, distance,
        })),
      });
      message.success('Via Route saved');
      navigate('/admin-module');
    } catch (err: any) {
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Route Name', dataIndex: 'routeName', key: 'routeName',
      render: (_: any, row: RouteRow) => (
        <Input
          size="small"
          value={row.routeName}
          onChange={(e) => updateRow(row.key, { routeName: e.target.value })}
        />
      ),
    },
    {
      title: 'Chainage Point (Meter)', dataIndex: 'chainagePoint', key: 'chainage', width: 260,
      render: (_: any, row: RouteRow) => (
        <InputNumber
          size="small"
          min={0}
          value={row.chainagePoint}
          onChange={(v) => updateRow(row.key, { chainagePoint: Number(v) || 0 })}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Distance (KM)', dataIndex: 'distance', key: 'distance', width: 200,
      render: (_: any, row: RouteRow) => (
        <InputNumber
          size="small"
          min={0}
          step={0.01}
          value={row.distance}
          onChange={(v) => updateRow(row.key, { distance: Number(v) || 0 })}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '', key: 'del', width: 60,
      render: (_: any, row: RouteRow) => (
        <Button danger size="small" onClick={() => removeRow(row.key)} disabled={rows.length === 1}>
          Del
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Via Route</Title>
        <Button icon={<ListIcon size={14} />} onClick={() => navigate('/admin-module/master/site-location/list')}>
          List
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">New Mode</Text>

        <Form layout="horizontal" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mb-4">
            <Form.Item
              label={<span>From Location <span className="text-red-500">*</span></span>}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
              required
            >
              <Select
                value={fromLocation}
                onChange={setFromLocation}
                showSearch
                placeholder="Select From Location"
                optionFilterProp="label"
                filterOption={(input, opt) =>
                  String(opt?.searchText ?? opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={locationOptions}
                allowClear
              />
            </Form.Item>
            <Form.Item
              label={<span>To Location <span className="text-red-500">*</span></span>}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
              required
            >
              <Select
                value={toLocation}
                onChange={setToLocation}
                showSearch
                placeholder="Select To Location"
                optionFilterProp="label"
                filterOption={(input, opt) =>
                  String(opt?.searchText ?? opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={locationOptions}
                allowClear
              />
            </Form.Item>
          </div>

          <div className="flex justify-end mb-2">
            <Button type="primary" size="small" danger onClick={addRow}>Add Row</Button>
          </div>

          <Table
            dataSource={rows}
            columns={columns}
            rowKey="key"
            size="small"
            pagination={false}
            bordered
          />

          <div className="flex justify-center gap-3 mt-6">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
