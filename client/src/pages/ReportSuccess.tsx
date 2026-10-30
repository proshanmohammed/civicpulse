import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  Wrench, 
  MapPin, 
  GitMerge, 
  Share2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { fetchReportById } from '../lib/api';
import { Report } from '../types';
import { StatusTimeline } from '../components/StatusTimeline';
import { getPriorityBadge, getCategoryBadge, getStatusBadge } from '../lib/utils';

export const ReportSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = async () => {
    if (!id) return;
    try {
      setRefreshing(true);
      const data = await fetchReportById(id);
      setReport(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load report:', err);
      setError(err.message || 'Report could not be retrieved.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 }
      });
    } catch (e) {
      // ignore
    }
  }, [id]);

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-lg font-bold text-white">Retrieving Live Triage Timeline...</h2>
        <p className="text-xs text-slate-400">Connecting to municipal ledger & vector database...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The grievance ID <span className="font-mono text-indigo-300">"{id}"</span> could not be located. It may have expired or the ID was mistyped.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Feed
          </Link>
        </div>
      </div>
    );
  }

  const prio = getPriorityBadge(report.priority, report.priority_score);
  const cat = getCategoryBadge(report.category);
  const stat = getStatusBadge(report.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      
      {/* Top Breadcrumb & Live Refresh */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Grievance Feed</span>
        </Link>

        <button
          onClick={loadReport}
          disabled={refreshing}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Confirmation Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#061414] via-[#07101c] to-[#05080f] shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
                Hazard Successfully Registered
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                MetroShield Live Incident Tracker
              </h1>
            </div>
          </div>

          {/* Copyable Tracking ID */}
          <div className="flex items-center gap-2 bg-[#090f1a] p-2 rounded-xl border border-emerald-500/25">
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-500 block uppercase">Tracking ID:</span>
              <span className="text-xs text-emerald-300 font-semibold">{report.id.slice(0, 18)}...</span>
            </div>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black transition-all"
              title="Copy ID to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* AI Triage Intelligence Card */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${prio.bg}`}>
                Priority {report.priority_score}/100 · {report.priority}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${cat.bg}`}>
                {cat.label}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${stat.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} inline-block mr-1.5`} />
              {stat.label}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {report.title}
          </h2>

          {/* AI Explainable Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini AI Municipal Triage Snapshot
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.ai_explanation || 'Priority score computed based on physical proximity to public corridors, severity of structural impedance, and safety exposure risk.'}
            </p>
          </div>

          {/* Field Crew Action Directive */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              Automated Field Action Directive
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {report.action_brief || 'Specialized municipal response unit dispatched for on-site survey and hazard stabilization.'}
            </p>
          </div>

          {/* Duplicate Banner if merged */}
          {report.is_duplicate && (
            <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-start gap-2.5">
              <GitMerge className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-violet-300 block">
                  Semantically Merged Duplicate Ticket
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Our pgvector embedding engine recognized this as part of active incident #{report.parent_duplicate_id?.slice(0, 8)}... Your report adds extra telemetry for the field team!
                </p>
              </div>
            </div>
          )}

          {/* Location and Reporter Contact info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 truncate max-w-sm">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{report.address}</span>
            </div>

            {report.reporter_contact && (
              <span className="text-[11px] font-mono text-slate-400">
                Alerts to: {report.reporter_contact}
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Visual Lifecycle Progress Timeline */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="mb-6 pb-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Resolution Progression
            </h3>
            <p className="text-xs text-slate-400">Follow every lifecycle stage from initial AI triage to field completion</p>
          </div>
          <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
            Public Audit Log
          </span>
        </div>

        <StatusTimeline
          currentStatus={report.status}
          activityLogs={report.activity_logs}
          assignedTo={report.assigned_to}
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          to="/report"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
        >
          Report Another Issue
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          View Citywide Public Feed &rarr;
        </Link>
      </div>

    </div>
  );
};
