import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, App, Button, Typography, Space } from 'antd';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useCreateBranch, useUpdateBranch, useBranchList } from '@/hooks/queries/useBranches';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const BranchForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const { data: branchData } = useBranchList();
  const [previewCoords, setPreviewCoords] = useState<{ lat: number; lng: number } | null>(null);

  const isEdit = !!id;
  const editData = isEdit ? (branchData?.data ?? []).find((b: any) => (b._id || b.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        latitude: editData.latitude,
        longitude: editData.longitude,
      });
      if (editData.latitude != null && editData.longitude != null) {
        setPreviewCoords({ lat: editData.latitude, lng: editData.longitude });
      }
    }
  }, [editData, form]);

  function handleCoordsChange() {
    const lat = form.getFieldValue('latitude');
    const lng = form.getFieldValue('longitude');
    if (lat != null && lng != null) {
      setPreviewCoords({ lat, lng });
    } else {
      setPreviewCoords(null);
    }
  }

  function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
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
      setTimeout(() => (e.target as HTMLInputElement).value = '', 0);
      e.preventDefault();
    }
  }

  async function detectLocation() {
    if (!('geolocation' in navigator)) {
      message.error('Geolocation is not supported by your browser.');
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

  const handleSubmit = async (values: any) => {
    // Strip null coordinates (empty InputNumber) — don't send null to the server
    if (values.latitude == null) delete values.latitude;
    if (values.longitude == null) delete values.longitude;
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Branch updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Branch created');
      }
      navigate('/branches');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} branch`);
    }
  };

  const mapUrl = previewCoords
    ? `https://www.openstreetmap.org/?mlat=${previewCoords.lat}&mlon=${previewCoords.lng}&zoom=15`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/branches')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' Branch' : t('add_branch')}</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* ─── Basic Info ─────────────────────────────────────────────────── */}
        <Card bordered={false} className="max-w-2xl mb-4" title="Branch Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item name="name" label="Branch Name" rules={[{ required: true, message: 'Branch name is required' }]}>
              <Input placeholder="e.g. Head Office" />
            </Form.Item>
            <Form.Item name="code" label="Branch Code" rules={[{ required: true, message: 'Branch code is required' }]}>
              <Input placeholder="e.g. HO" />
            </Form.Item>
          </div>
        </Card>

        {/* ─── Site Location ──────────────────────────────────────────────── */}
        <Card
          bordered={false}
          className="max-w-2xl mb-4"
          title={
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              Site Location
            </span>
          }
          extra={
            <Button icon={<MapPin size={14} />} size="small" onClick={detectLocation}>
              Use my location
            </Button>
          }
        >
          {/* Google Maps link paste */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">
              Paste a Google Maps link to auto-fill coordinates
            </div>
            <Input
              placeholder="Paste Google Maps URL here — e.g. https://www.google.com/maps/place/.../@28.123,77.456,17z/..."
              onPaste={handleMapLinkPaste}
              allowClear
              prefix={<MapPin size={13} className="text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[{ type: 'number', min: -90, max: 90, message: 'Must be between -90 and 90' }]}
            >
              <InputNumber
                placeholder="e.g. 28.6139"
                className="w-full"
                precision={6}
                onChange={handleCoordsChange}
              />
            </Form.Item>
            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[{ type: 'number', min: -180, max: 180, message: 'Must be between -180 and 180' }]}
            >
              <InputNumber
                placeholder="e.g. 77.2090"
                className="w-full"
                precision={6}
                onChange={handleCoordsChange}
              />
            </Form.Item>
          </div>

          {mapUrl && (
            <div className="mb-3">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                Open in OpenStreetMap ↗
              </a>
            </div>
          )}

          {previewCoords && (
            <div className="rounded-lg overflow-hidden border">
              <iframe
                title="Site location map"
                width="100%"
                height="260"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${previewCoords.lng - 0.01},${previewCoords.lat - 0.01},${previewCoords.lng + 0.01},${previewCoords.lat + 0.01}&layer=mapnik&marker=${previewCoords.lat},${previewCoords.lng}`}
                style={{ border: 0 }}
              />
              <div className="px-3 py-2 bg-gray-50 flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={12} />
                <Text type="secondary">
                  {previewCoords.lat.toFixed(6)}, {previewCoords.lng.toFixed(6)}
                </Text>
              </div>
            </div>
          )}

          {!previewCoords && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 h-32 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
              <MapPin size={24} />
              <span>Enter coordinates or use "Use my location" to pin this site on the map</span>
            </div>
          )}
        </Card>

        <div className="max-w-2xl">
          <Space>
            <Button onClick={() => navigate('/branches')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default BranchForm;
