import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Sparkles, 
  Layers, 
  Radio, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  List
} from 'lucide-react';
import { fetchReports, fetchStats, fetchClusters } from '../lib/api';
import { Report, CityStats, ClusterInsight } from '../types';
import { MetricsGrid } from '../components/MetricsGrid';
import { ReportCard } from '../components/ReportCard';
import { MapDashboard } from '../components/MapDashboard';
import { useAuth } from '../context/AuthContext';

export const CitizenTracker: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Citizen';

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [clusters, setClusters] = useState<ClusterInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reportsData, statsData, clustersData] = await Promise.all([
          fetchReports(),
          fetchStats(),
          fetchClusters()
        ]);
        setReports(reportsData);
        setStats(statsData);
        setClusters(clustersData);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTicketSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearchInput.trim()) return;
    navigate(`/report/success/${ticketSearchInput.trim()}`);
  };

  const filteredReports = reports.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = [
    { key: 'all', label: 'All Issues' },
    { key: 'waterlogging', label: 'Waterlogging' },
    { key: 'roads', label: 'Roads & Potholes' },
    { key: 'waste', label: 'Waste & Sanitation' },
    { key: 'streetlights', label: 'Streetlights' },
    { key: 'electrical', label: 'Electrical Hazards' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Welcome back, <strong>{firstName}</strong> · Citizen Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Transforming Citizen Voices into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Prioritized Civic Action
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            CivicPulse bridges citizens and municipal responders using Gemini AI: automated duplicate clustering, explainable priority scoring, and transparent tracking in real time.
          </p>

          {/* Action CTAs & Quick Lookup */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/report"
              className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report an Issue (&lt; 1 min)</span>
            </Link>

            {/* Quick Ticket Lookup Box */}
            <form onSubmit={handleTicketSearch} className="flex-1 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Ticket ID to track live..."
                  value={ticketSearchInput}
                  onChange={(e) => setTicketSearchInput(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shrink-0 transition-colors"
              >
                Track
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* City Health KPI Metrics */}
      <MetricsGrid stats={stats} loading={loading} />

      {/* Public Feed & Map Header Controls */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Public Civic Grievance Feed</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {filteredReports.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent ledger of reported community concerns and current municipal remediation status.
            </p>
          </div>

          {/* View Mode Toggle (Cards vs Interactive Map) */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'feed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grievance Feed</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Spatial Map</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Text Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search issues or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

        </div>

        {/* Content View: Feed Grid vs Interactive Map */}
        {viewMode === 'map' ? (
          <div className="animate-fade-in">
            <MapDashboard
              reports={filteredReports}
              clusters={clusters}
              height="600px"
              showClustersByDefault={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} isAdmin={false} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
