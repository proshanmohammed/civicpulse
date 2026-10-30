import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Flame, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  ArrowLeft, 
  RefreshCw, 
  Wrench, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building
} from 'lucide-react';
import { fetchClusters, fetchReports } from '../lib/api';
import { ClusterInsight, Report } from '../types';
import { MapDashboard } from '../components/MapDashboard';
import { getPriorityBadge, getCategoryBadge, getStatusBadge } from '../lib/utils';
import { FALLBACK_CLUSTERS, FALLBACK_REPORTS } from '../lib/fallbackData';

export const ClusterIntelligence: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterInsight[]>(FALLBACK_CLUSTERS);
  const [reports, setReports] = useState<Report[]>(FALLBACK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(FALLBACK_CLUSTERS[0]?.id || null);

  const loadClusterData = async () => {
    try {
      setRefreshing(true);
      const [clusterDataRes, reportDataRes] = await Promise.allSettled([
        fetchClusters(),
        fetchReports()
      ]);
      const clusterData = clusterDataRes.status === 'fulfilled' && clusterDataRes.value.length > 0 
        ? clusterDataRes.value 
        : FALLBACK_CLUSTERS;
      const reportData = reportDataRes.status === 'fulfilled' && reportDataRes.value.length > 0 
        ? reportDataRes.value 
        : FALLBACK_REPORTS;
      setClusters(clusterData);
      setReports(reportData);
      if (clusterData.length > 0 && !selectedClusterId) {
        setSelectedClusterId(clusterData[0].id);
      }
    } catch (err) {
      console.error('Failed to load clusters:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClusterData();
  }, []);

  const activeCluster = clusters.find(c => c.id === selectedClusterId) || clusters[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white mr-1">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Spatial Hotspot & Cluster Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-11">
            Algorithmic spatial density clustering (DBSCAN 450m radius) identifying recurring civic failure points and systemic hazards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClusterData}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Re-analyzing...' : 'Recompute Hotspots'}</span>
          </button>
        </div>
      </div>

      {/* Main Map View with Cluster Radii */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Interactive Spatial Cluster Bounding View</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {clusters.length} active geographic clusters detected
          </span>
        </div>

        <MapDashboard
          reports={reports}
          clusters={clusters}
          height="450px"
          showClustersByDefault={true}
        />
      </div>

      {/* Cluster Details Grid: Left Cluster List, Right Deep Dive & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cluster Selector Cards */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Detected Civic Hotspots
          </div>

          <div className="space-y-3">
            {clusters.map((cluster) => {
              const isSelected = selectedClusterId === cluster.id;
              const isCrit = cluster.severity === 'Critical';

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isCrit 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                        : cluster.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    }`}>
                      {cluster.severity} Hotspot
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      {cluster.report_count} Grievances
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 mb-1">
                    {cluster.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cluster.executive_action_brief}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Radius: ~{cluster.radius_meters}m</span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                      View reports &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Hotspot Action Brief & Clustered Reports */}
        <div className="lg:col-span-2 space-y-6">
          {activeCluster ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
              
              {/* Hotspot Header */}
              <div className="pb-4 border-b border-slate-800 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      HOTSPOT #{activeCluster.id.toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      activeCluster.severity === 'Critical' 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {activeCluster.severity} Severity
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {activeCluster.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Centroid: Lat {activeCluster.center.latitude}, Lon {activeCluster.center.longitude}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-white">{activeCluster.report_count}</span>
                  <span className="text-xs text-slate-500 block">reports in {activeCluster.radius_meters}m</span>
                </div>
              </div>

              {/* Executive Action Brief Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/30 border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Executive Municipal Action Brief
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                  {activeCluster.executive_action_brief}
                </p>
              </div>

              {/* Clustered Grievances List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Individual Grievances Consolidated in this Cluster
                </h3>

                <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                  {activeCluster.reports.map((r) => {
                    const prio = getPriorityBadge(r.priority, r.priority_score);
                    const stat = getStatusBadge(r.status);

                    return (
                      <div key={r.id} className="p-4 hover:bg-slate-900/60 transition-colors flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prio.bg}`}>
                              {r.priority_score}/100
                            </span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stat.bg}`}>
                              {stat.label}
                            </span>
                          </div>
                          <Link 
                            to={`/admin/reports/${r.id}`}
                            className="font-bold text-xs sm:text-sm text-white hover:text-indigo-400 transition-colors line-clamp-1 block"
                          >
                            {r.title}
                          </Link>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{r.address || 'Address on record'}</span>
                          </div>
                        </div>

                        <Link
                          to={`/admin/reports/${r.id}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all shrink-0"
                          title="Open Action Console"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl border border-slate-800">
              Select a cluster from the left to view spatial analytics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
