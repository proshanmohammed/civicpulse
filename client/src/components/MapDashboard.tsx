import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { 
  Filter, 
  Layers, 
  MapPin, 
  ExternalLink, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  Car, 
  Trash2, 
  Lightbulb, 
  Zap,
  Maximize2
} from 'lucide-react';
import { Report, ClusterInsight, ReportCategory, PriorityLevel } from '../types';
import { getPriorityBadge, getStatusBadge } from '../lib/utils';

// Helper to create custom SVG map marker icons based on priority
function createCustomPin(priority: PriorityLevel, isCluster: boolean = false) {
  let color = '#6366f1';
  let pulseGlow = '';

  if (priority === 'Critical') {
    color = '#ef4444';
    pulseGlow = 'animation: pulse 1.5s infinite;';
  } else if (priority === 'High') {
    color = '#f59e0b';
  } else if (priority === 'Medium') {
    color = '#eab308';
  } else {
    color = '#64748b';
  }

  const svgIcon = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${color}; opacity: 0.25; ${pulseGlow}"></div>
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Controller to smoothly pan to coordinates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface MapDashboardProps {
  reports: Report[];
  clusters?: ClusterInsight[];
  height?: string;
  selectedReportId?: string | null;
  onSelectReport?: (report: Report) => void;
  showClustersByDefault?: boolean;
}

export const MapDashboard: React.FC<MapDashboardProps> = ({
  reports,
  clusters = [],
  height = '520px',
  selectedReportId,
  onSelectReport,
  showClustersByDefault = true
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePriority, setActivePriority] = useState<string>('all');
  const [showClusters, setShowClusters] = useState(showClustersByDefault);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (activePriority !== 'all' && r.priority !== activePriority) return false;
    return true;
  });

  // Center on selected report if provided
  useEffect(() => {
    if (selectedReportId) {
      const target = reports.find(r => r.id === selectedReportId);
      if (target) {
        setMapCenter([target.latitude, target.longitude]);
        setMapZoom(15);
      }
    }
  }, [selectedReportId, reports]);

  const categories: { key: string; label: string; icon: any }[] = [
    { key: 'all', label: 'All', icon: Layers },
    { key: 'waterlogging', label: 'Water', icon: Droplet },
    { key: 'roads', label: 'Roads', icon: Car },
    { key: 'waste', label: 'Waste', icon: Trash2 },
    { key: 'streetlights', label: 'Lighting', icon: Lightbulb },
    { key: 'electrical', label: 'Electrical', icon: Zap },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col">
      
      {/* Top Map Control Bar */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap z-20">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Priority & Cluster Controls */}
        <div className="flex items-center gap-2">
          {/* Priority dropdown */}
          <select
            value={activePriority}
            onChange={(e) => setActivePriority(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical Danger</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Hotspot Cluster Toggle */}
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
              showClusters
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Spatial Hotspot Radii"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Hotspots ({clusters.length})</span>
          </button>
        </div>

      </div>

      {/* Interactive Leaflet Map */}
      <div style={{ height }} className="w-full relative z-10">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Render Spatial Hotspot Clusters as Translucent Circles */}
          {showClusters && clusters.map((cluster) => {
            const isCrit = cluster.severity === 'Critical';
            const circleColor = isCrit ? '#ef4444' : cluster.severity === 'High' ? '#f59e0b' : '#6366f1';

            return (
              <Circle
                key={cluster.id}
                center={[cluster.center.latitude, cluster.center.longitude]}
                radius={cluster.radius_meters || 450}
                pathOptions={{
                  color: circleColor,
                  fillColor: circleColor,
                  fillOpacity: isCrit ? 0.22 : 0.14,
                  weight: 2,
                  dashArray: isCrit ? '4, 4' : undefined
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 max-w-xs text-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>{cluster.title}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong>{cluster.report_count} clustered grievances</strong> within {cluster.radius_meters}m
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      {cluster.executive_action_brief}
                    </p>
                    <Link
                      to="/admin/clusters"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 pt-1"
                    >
                      View Hotspot Intelligence &rarr;
                    </Link>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Render Filtered Reports as Pins */}
          {filteredReports.map((report) => {
            const markerIcon = createCustomPin(report.priority, false);
            const prioBadge = getPriorityBadge(report.priority);
            const statusBadge = getStatusBadge(report.status);

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    if (onSelectReport) onSelectReport(report);
                  }
                }}
              >
                <Popup>
                  <div className="p-2 max-w-xs space-y-2 text-slate-100">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prioBadge.bg}`}>
                        {report.priority_score}/100 · {report.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {report.title}
                    </h4>

                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {report.ai_summary || report.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="truncate max-w-[170px]">{report.address}</span>
                      <Link
                        to={`/admin/reports/${report.id}`}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
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

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-xl hidden sm:block pointer-events-auto">
          <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-1">
            Priority Intensity
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse"></span>
            <span>Critical Danger (90-100)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>High Priority (70-89)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span>Medium (40-69)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Low (0-39)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
