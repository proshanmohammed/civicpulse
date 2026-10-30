import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import {
  Filter,
  Layers,
  MapPin,
  ExternalLink,
  Flame,
  Droplet,
  Car,
  Trash2,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { Report, ClusterInsight, PriorityLevel } from '../types';
import { getPriorityBadge, getStatusBadge } from '../lib/utils';

// ─── Fix Leaflet default marker icon (broken in Vite/Webpack builds) ──────────
// This is required because bundlers rewrite asset URLs and break the default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Custom priority-colored SVG pin ─────────────────────────────────────────
function createCustomPin(priority: PriorityLevel) {
  const colorMap: Record<PriorityLevel, { ring: string; dot: string; glow: string }> = {
    Critical: { ring: '#ef4444', dot: '#fca5a5', glow: 'rgba(239,68,68,0.4)' },
    High:     { ring: '#f59e0b', dot: '#fcd34d', glow: 'rgba(245,158,11,0.3)' },
    Medium:   { ring: '#eab308', dot: '#fde047', glow: 'rgba(234,179,8,0.25)' },
    Low:      { ring: '#64748b', dot: '#94a3b8', glow: 'rgba(100,116,139,0.2)' },
  };
  const { ring, dot, glow } = colorMap[priority] ?? colorMap.Low;

  const pulse = priority === 'Critical'
    ? `<div style="position:absolute;inset:0;border-radius:50%;background:${ring};opacity:0.3;animation:lf-pulse 1.6s ease-in-out infinite;"></div>`
    : '';

  const html = `
    <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
      ${pulse}
      <div style="width:26px;height:26px;border-radius:50%;background:#0f172a;border:3px solid ${ring};
                  box-shadow:0 0 14px ${glow},0 3px 10px rgba(0,0,0,0.6);
                  display:flex;align-items:center;justify-content:center;position:relative;z-index:1;">
        <div style="width:9px;height:9px;border-radius:50%;background:${dot};"></div>
      </div>
    </div>
    <style>
      @keyframes lf-pulse {
        0%,100%{transform:scale(1);opacity:0.3}
        50%{transform:scale(1.7);opacity:0}
      }
      .custom-leaflet-marker{background:transparent!important;border:none!important;}
    </style>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// ─── Map view controller ──────────────────────────────────────────────────────
function MapPanner({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (
      prevCenter.current &&
      prevCenter.current[0] === center[0] &&
      prevCenter.current[1] === center[1]
    ) return;
    prevCenter.current = center;
    map.flyTo(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapDashboardProps {
  reports: Report[];
  clusters?: ClusterInsight[];
  height?: string;
  selectedReportId?: string | null;
  onSelectReport?: (report: Report) => void;
  showClustersByDefault?: boolean;
}

const CATEGORY_FILTERS = [
  { key: 'all',          label: 'All',       icon: Layers   },
  { key: 'waterlogging', label: 'Water',     icon: Droplet  },
  { key: 'roads',        label: 'Roads',     icon: Car      },
  { key: 'waste',        label: 'Waste',     icon: Trash2   },
  { key: 'streetlights', label: 'Lighting',  icon: Lightbulb},
  { key: 'electrical',   label: 'Electrical',icon: Zap      },
];

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  High:     'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Medium:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Low:      'bg-slate-700/40 text-slate-300 border-slate-600/40',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const MapDashboard: React.FC<MapDashboardProps> = ({
  reports,
  clusters = [],
  height = '520px',
  selectedReportId,
  onSelectReport,
  showClustersByDefault = true,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [showClusters, setShowClusters] = useState(showClustersByDefault);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India default
  const [mapZoom, setMapZoom] = useState(5);
  const [mapKey] = useState(() => Math.random().toString(36).slice(2)); // Stable key prevents remount

  // Auto-center on reports when data loads
  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(r => r.latitude && r.longitude);
      if (validReports.length === 0) return;
      const avgLat = validReports.reduce((s, r) => s + r.latitude, 0) / validReports.length;
      const avgLng = validReports.reduce((s, r) => s + r.longitude, 0) / validReports.length;
      setMapCenter([avgLat, avgLng]);
      setMapZoom(13);
    }
  }, [reports.length]);

  // Pan to selected report
  useEffect(() => {
    if (selectedReportId) {
      const target = reports.find(r => r.id === selectedReportId);
      if (target?.latitude && target?.longitude) {
        setMapCenter([target.latitude, target.longitude]);
        setMapZoom(16);
      }
    }
  }, [selectedReportId, reports]);

  const filteredReports = reports.filter(r => {
    if (!r.latitude || !r.longitude) return false;
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (activePriority !== 'all' && r.priority !== activePriority) return false;
    return true;
  });

  const criticalCount = reports.filter(r => r.priority === 'Critical').length;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950 flex flex-col">

      {/* ── Map Controls Bar ── */}
      <div className="px-3 py-2.5 bg-[#0d1527]/95 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORY_FILTERS.map(({ key, label, icon: Icon }) => {
            const active = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Priority & Cluster Controls */}
        <div className="flex items-center gap-2">
          <select
            value={activePriority}
            onChange={e => setActivePriority(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟡 High</option>
            <option value="Medium">🟢 Medium</option>
            <option value="Low">⚪ Low</option>
          </select>

          <button
            onClick={() => setShowClusters(s => !s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
              showClusters
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Spatial Hotspot Radii"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Hotspots ({clusters.length})
          </button>

          {/* Live pin count badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{filteredReports.length} pins</span>
            {criticalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse">
                {criticalCount} CRIT
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Leaflet Map ── */}
      <div style={{ height }} className="w-full relative">

        {/* Empty state overlay */}
        {filteredReports.length === 0 && !showClusters && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 pointer-events-none">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-500">No reports match the active filters</p>
            </div>
          </div>
        )}

        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          zoomControl={true}
          style={{ height: '100%', width: '100%', background: '#0a0f1d' }}
          // Force re-use container on state changes (do NOT re-key)
          preferCanvas={false}
        >
          {/* Smooth pan controller */}
          <MapPanner center={mapCenter} zoom={mapZoom} />

          {/* Free OSM tiles — no API key needed. Dark theme applied via CSS filter in index.css */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={['a', 'b', 'c']}
            maxZoom={19}
          />

          {/* ── Spatial Cluster Radii ── */}
          {showClusters && clusters.map(cluster => {
            if (!cluster.center?.latitude || !cluster.center?.longitude) return null;
            const isCrit = cluster.severity === 'Critical';
            const isHigh = cluster.severity === 'High';
            const color = isCrit ? '#ef4444' : isHigh ? '#f59e0b' : '#6366f1';

            return (
              <Circle
                key={cluster.id}
                center={[cluster.center.latitude, cluster.center.longitude]}
                radius={cluster.radius_meters || 450}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isCrit ? 0.18 : 0.1,
                  weight: isCrit ? 2 : 1.5,
                  dashArray: isCrit ? '6 4' : '4 4',
                }}
              >
                <Popup maxWidth={280}>
                  <div className="space-y-2 text-slate-100 p-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-400">
                      <Flame className="w-4 h-4 flex-shrink-0" />
                      {cluster.title}
                    </div>
                    <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_COLORS[cluster.severity] ?? ''}`}>
                      {cluster.severity} Severity · {cluster.report_count} Grievances
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                      {cluster.executive_action_brief}
                    </p>
                    <Link
                      to="/admin/clusters"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Open Hotspot Intelligence →
                    </Link>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* ── Report Pins ── */}
          {filteredReports.map(report => {
            const icon = createCustomPin(report.priority);
            const prioBadge = getPriorityBadge(report.priority);
            const statusBadge = getStatusBadge(report.status);
            const isSelected = report.id === selectedReportId;

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={icon}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                  click: () => onSelectReport?.(report),
                }}
              >
                <Popup maxWidth={300} minWidth={240}>
                  <div className="space-y-2 text-slate-100 p-1">
                    {/* Priority + Status row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prioBadge.bg}`}>
                        {report.priority_score}/100 · {report.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {report.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                      {report.ai_summary || report.description}
                    </p>

                    {/* Address + inspect link */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
                      <div className="flex items-center gap-1 truncate flex-1 mr-2">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
                      </div>
                      <Link
                        to={`/admin/reports/${report.id}`}
                        className="shrink-0 font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
                      >
                        Inspect
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>

        {/* ── Floating Priority Legend ── */}
        <div className="absolute bottom-4 right-4 z-[400] bg-[#0d1527]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 text-[11px] space-y-1.5 shadow-xl hidden sm:block pointer-events-auto">
          <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
            Priority Legend
          </div>
          {[
            { color: 'bg-rose-500',   label: 'Critical (90-100)', pulse: true  },
            { color: 'bg-amber-500',  label: 'High (70-89)',      pulse: false },
            { color: 'bg-yellow-400', label: 'Medium (40-69)',    pulse: false },
            { color: 'bg-slate-500',  label: 'Low (0-39)',        pulse: false },
          ].map(({ color, label, pulse }) => (
            <div key={label} className="flex items-center gap-2 text-slate-300">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color} ${pulse ? 'animate-pulse shadow-sm shadow-rose-500/60' : ''}`} />
              {label}
            </div>
          ))}

          {showClusters && clusters.length > 0 && (
            <div className="pt-1.5 border-t border-slate-700/50 mt-1">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-rose-400 bg-rose-400/10 shrink-0" />
                Hotspot radius
              </div>
            </div>
          )}
        </div>

        {/* ── Floating coordinate display on hover (bottom-left) ── */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#0d1527]/80 backdrop-blur-sm border border-slate-700/40 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-400 hidden sm:flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {filteredReports.length} of {reports.length} issues visible · {clusters.length} hotspot clusters
        </div>
      </div>
    </div>
  );
};
