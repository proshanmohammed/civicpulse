import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Layers, 
  MapPin, 
  Sparkles, 
  Filter, 
  Database, 
  RefreshCw, 
  Activity, 
  Flame,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { fetchReports, fetchStats, fetchClusters, seedData } from '../lib/api';
import { Report, CityStats, ClusterInsight } from '../types';
import { MetricsGrid } from '../components/MetricsGrid';
import { MapDashboard } from '../components/MapDashboard';
import { AdminQueueTable } from '../components/AdminQueueTable';
import { ActionBriefModal } from '../components/ActionBriefModal';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [clusters, setClusters] = useState<ClusterInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeActionBriefReport, setActiveActionBriefReport] = useState<Report | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [reportsData, statsData, clustersData] = await Promise.all([
        fetchReports(),
        fetchStats(),
        fetchClusters()
      ]);
      setReports(reportsData);
      setStats(statsData);
      setClusters(clustersData);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleReportUpdated = (updated: Report) => {
    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
    // refresh stats
    fetchStats().then(setStats).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Municipal Operations Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated grievance triage, spatial hotspot containment, and field crew orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/clusters"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hotspots & Clusters ({clusters.length})</span>
          </Link>

          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <MetricsGrid stats={stats} loading={loading} />

      {/* Spatial Hotspot & Geographic Map View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>City Spatial Grievance Map</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                LIVE GEO-TELEMETRY
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pins color-coded by priority with spatial hazard clusters highlighted in translucent radii.
            </p>
          </div>

          <Link
            to="/admin/clusters"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            <span>View Hotspot Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <MapDashboard
          reports={reports}
          clusters={clusters}
          height="480px"
          selectedReportId={selectedReportId}
          onSelectReport={(r) => setSelectedReportId(r.id)}
          showClustersByDefault={true}
        />
      </div>

      {/* Administrative Action Queue Data Table */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Incoming Grievance Triage Queue
          </h3>
          <p className="text-xs text-slate-400">
            Sort by AI priority score, dispatch field teams, advance statuses, or inspect vector duplicate connections.
          </p>
        </div>

        <AdminQueueTable
          reports={reports}
          onReportUpdated={handleReportUpdated}
          onOpenActionBrief={(report) => setActiveActionBriefReport(report)}
        />
      </div>

      {/* AI Action Brief Pop-up Modal */}
      <ActionBriefModal
        report={activeActionBriefReport}
        onClose={() => setActiveActionBriefReport(null)}
      />

    </div>
  );
};
