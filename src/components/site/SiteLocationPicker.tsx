import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, InputNumber, Space, Typography, App } from 'antd';
import { Crosshair } from 'lucide-react';

// Fix default marker icons (Leaflet+bundlers issue).
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Props {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India centroid

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      map.setView([lat, lng], Math.max(map.getZoom(), 14));
    }
  }, [lat, lng, map]);
  return null;
}

const SiteLocationPicker: React.FC<Props> = ({ latitude, longitude, onChange }) => {
  const { message } = App.useApp();
  const [locating, setLocating] = useState(false);
  const hasPin = typeof latitude === 'number' && typeof longitude === 'number';
  const center: [number, number] = hasPin ? [latitude!, longitude!] : DEFAULT_CENTER;

  const useCurrent = () => {
    if (!('geolocation' in navigator)) {
      message.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        message.error(err.message || 'Failed to fetch current location');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-2">
      <Space wrap>
        <Typography.Text strong>Latitude</Typography.Text>
        <InputNumber
          value={latitude}
          onChange={(v) => onChange(Number(v ?? 0), longitude ?? 0)}
          step={0.000001}
          min={-90}
          max={90}
          className="w-44"
        />
        <Typography.Text strong>Longitude</Typography.Text>
        <InputNumber
          value={longitude}
          onChange={(v) => onChange(latitude ?? 0, Number(v ?? 0))}
          step={0.000001}
          min={-180}
          max={180}
          className="w-44"
        />
        <Button icon={<Crosshair size={14} />} onClick={useCurrent} loading={locating}>
          Use my current location
        </Button>
      </Space>
      <Typography.Text type="secondary" className="block text-xs">
        Click anywhere on the map to drop the site pin.
      </Typography.Text>
      <div style={{ height: 320 }} className="rounded-md overflow-hidden border">
        <MapContainer
          center={center}
          zoom={hasPin ? 14 : 5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          <Recenter lat={latitude} lng={longitude} />
          {hasPin && <Marker position={[latitude!, longitude!]} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default SiteLocationPicker;
