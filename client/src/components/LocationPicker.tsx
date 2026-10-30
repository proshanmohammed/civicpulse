import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix broken Leaflet default icon in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Pin for citizen location selector
const pickerIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #6366f1; opacity: 0.35; animation: pulse 1.2s infinite;"></div>
      <div style="width: 24px; height: 24px; border-radius: 50%; background: #4f46e5; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `,
  className: 'location-picker-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    }
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prev = useRef<string>('');
  useEffect(() => {
    const key = `${center[0]},${center[1]}`;
    if (prev.current === key) return;
    prev.current = key;
    map.flyTo(center, 15, { animate: true, duration: 0.6 });
  }, [center, map]);
  return null;
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, addressHint?: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [mapKey] = useState(() => `lp-${Math.random().toString(36).slice(2)}`);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        onLocationChange(lat, lng, 'Current Device Geolocation');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        // Default to metropolitan center
        onLocationChange(37.7749, -122.4194, 'Civic Center, Market Street');
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          Tap map to pin exact grievance location
        </span>
        <button
          type="button"
          onClick={handleUseGeolocation}
          disabled={isLocating}
          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 flex items-center gap-1 transition-all"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      <div className="h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700/80 relative shadow-inner">
        <MapContainer
          key={mapKey}
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#0a0f1d' }}
        >
          <MapCenterUpdater center={[latitude, longitude]} />
          <MapClickHandler onLocationSelect={onLocationChange} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={['a', 'b', 'c']}
          />
          <Marker position={[latitude, longitude]} icon={pickerIcon} />
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] glass-panel px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-700">
          Lat: {latitude.toFixed(4)}, Lon: {longitude.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
