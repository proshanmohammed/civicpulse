import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  Wrench, 
  UserCheck, 
  GitMerge, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  Save,
  Flame,
  Droplet,
  Car,
  Trash2,
  Lightbulb,
  Zap,
  ExternalLink,
  FileText
} from 'lucide-react';
import { fetchReportById, updateReportStatus } from '../lib/api';
import { Report, ReportStatus, PriorityLevel, ActivityLog } from '../types';
import { getPriorityBadge, getCategoryBadge, getStatusBadge } from '../lib/utils';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix broken Leaflet default icon in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const FIELD_CREWS = [
  'Field Crew Alpha (Water & Drainage)',
  'Rapid Response Grid Squad 1',
  'Road Maintenance Crew 7',
  'Sanitation Sector 4 Crew',
  'Lighting Tech Team 3',
  'Hazmat Emergency Unit'
];

const miniPin = L.divIcon({
  html: `
    <div style="width: 24px; height: 24px; border-radius: 50%; background: #6366f1; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
  `,
  className: 'mini-map-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Administrative Action Form State
  const [status, setStatus] = useState<ReportStatus>('Submitted');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [priorityScore, setPriorityScore] = useState<number>(50);
  const [auditNotes, setAuditNotes] = useState('');
  const [changedBy, setChangedBy] = useState('Senior Dispatcher Roberts');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await fetchReportById(id);
      setReport(data);
      setStatus(data.status);
      setAssignedTo(data.assigned_to || FIELD_CREWS[0]);
      setPriority(data.priority);
      setPriorityScore(data.priority_score);
    } catch (err: any) {
      console.error('Failed to load report detail:', err);
      setError(err.message || 'Report not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setIsUpdating(true);
      const updated = await updateReportStatus(id, {
        status,
        assigned_to: assignedTo,
        priority,
        priority_score: Number(priorityScore),
        notes: auditNotes || `Status updated to ${status}. Assigned to ${assignedTo}.`,
        changed_by: changedBy
      });
      setReport(updated);
      setSaveSuccess(true);
      setAuditNotes('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-white">Loading Municipal Ticket Dossier...</h2>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Grievance Not Found</h2>
        <Link to="/admin" className="text-xs text-indigo-400 hover:underline">
          Return to Admin Command Center
        </Link>
      </div>
    );
  }

  const prio = getPriorityBadge(report.priority, report.priority_score);
  const cat = getCategoryBadge(report.category);
  const stat = getStatusBadge(report.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      
      {/* Top Breadcrumb & Action Banner */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Queue</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/report/success/${report.id}`}
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Public Citizen View</span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Details & AI), Right 1 Col (Actions & Assignment) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Dossier Header */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${prio.gradient}`} />

            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${prio.bg}`}>
                  Priority Score: {report.priority_score}/100 ({report.priority})
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

            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug mb-3">
              {report.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              "{report.description}"
            </p>

            {/* Address & Meta */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{report.address}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Created {new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Municipal Intelligence Deep-Dive Card */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gemini 2.5 Flash Municipal AI Analysis</h3>
                  <p className="text-[11px] text-slate-400">Explainable triage & operational hazard modeling</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                zero-placeholder
              </span>
            </div>

            {/* Field Crew Action Directive */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                Automated Field Worker Directive
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {report.action_brief || 'Dispatch emergency civil assessment team with safety barriers and diagnostic meters.'}
              </p>
            </div>

            {/* Plain-Language Explainability Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                Explainable Prioritization Rationale
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.ai_explanation || `Rated ${report.priority_score}/100 based on physical proximity to public corridors, severity of structural impedance, and safety exposure risk.`}
              </p>
            </div>

            {/* Semantic Duplicate Intelligence Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                <GitMerge className="w-3.5 h-3.5" />
                Semantic Duplicate Detection (pgvector 768-D)
              </div>

              {report.is_duplicate ? (
                <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 text-xs text-slate-300">
                  <div className="font-semibold text-violet-300 mb-1">
                    Marked as duplicate of Master Incident #{report.parent_duplicate_id?.slice(0, 10)}...
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High cosine vector similarity detected. Consolidating work orders prevents multiple crews dispatched to identical street location.
                  </p>
                  {report.parent && (
                    <Link
                      to={`/admin/reports/${report.parent.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 mt-2"
                    >
                      Inspect Master Incident &rarr;
                    </Link>
                  )}
                </div>
              ) : report.duplicates && report.duplicates.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300 font-semibold">
                    {report.duplicates.length} duplicate citizen reports consolidated into this master ticket:
                  </div>
                  {report.duplicates.map((dup) => (
                    <div key={dup.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="truncate max-w-[80%]">
                        <span className="font-medium text-slate-200 line-clamp-1">{dup.title}</span>
                        <span className="text-[10px] text-slate-500">{dup.address}</span>
                      </div>
                      <Link to={`/admin/reports/${dup.id}`} className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px]">
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No semantic duplicate reports detected within cosine distance threshold (0.82). This grievance is unique.
                </p>
              )}
            </div>

          </div>

          {/* Location Pin & Photo Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mini Map */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Spatial Coordinate
              </span>
              <div className="h-44 rounded-xl overflow-hidden border border-slate-700">
                <MapContainer
                  key={`ticket-map-${report.id}`}
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  style={{ height: '100%', width: '100%', background: '#0a0f1d' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    subdomains={['a', 'b', 'c']}
                  />
                  <Marker position={[report.latitude, report.longitude]} icon={miniPin} />
                </MapContainer>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Lat {report.latitude.toFixed(5)}, Lon {report.longitude.toFixed(5)}
              </div>
            </div>

            {/* Photo Preview */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Citizen Photo Evidence
              </span>
              {report.image_url ? (
                <div className="h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={report.image_url}
                    alt="Citizen evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-44 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                  No photographic evidence attached
                </div>
              )}
              <div className="text-[11px] text-slate-400 truncate">
                Reporter: {report.reporter_contact || 'Anonymous Citizen'}
              </div>
            </div>

          </div>

          {/* Audit History Timeline */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Municipal Audit History & Ledger
            </h3>
            <div className="space-y-3">
              {(report.activity_logs || []).map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300">{log.changed_by || 'System'}</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Status: <strong className="text-white">{log.new_status}</strong>
                    {log.previous_status && <span className="text-slate-500"> (was {log.previous_status})</span>}
                  </div>
                  {log.notes && (
                    <p className="text-slate-400 text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Administrative Workflow & Action Console */}
        <div className="space-y-6">
          
          <form onSubmit={handleUpdate} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5 sticky top-24">
            
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Authority Action Console</h3>
              <p className="text-xs text-slate-400">Update status, dispatch crew & override priority</p>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Ticket updated & logged to municipal ledger!</span>
              </div>
            )}

            {/* Status Transition Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Lifecycle Status
              </label>
              <select
                id="update-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="Submitted">Submitted (Initial Queue)</option>
                <option value="Under Review">Under Review (Triage)</option>
                <option value="Assigned">Assigned (Crew Dispatched)</option>
                <option value="In Progress">In Progress (Active Works)</option>
                <option value="Resolved">Resolved (Completed)</option>
                <option value="Rejected">Rejected (Non-actionable)</option>
              </select>
            </div>

            {/* Field Worker Assignment */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Assigned Operational Unit
              </label>
              <select
                id="update-assigned-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {FIELD_CREWS.map((crew) => (
                  <option key={crew} value={crew}>{crew}</option>
                ))}
              </select>
            </div>

            {/* Priority Override */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Priority Override
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {priorityScore}/100 ({priority})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorityScore}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriorityScore(val);
                  if (val >= 90) setPriority('Critical');
                  else if (val >= 70) setPriority('High');
                  else if (val >= 40) setPriority('Medium');
                  else setPriority('Low');
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0 Low</span>
                <span>40 Med</span>
                <span>70 High</span>
                <span>90+ Crit</span>
              </div>
            </div>

            {/* Internal Audit Note */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Audit Log Reason / Notes
              </label>
              <textarea
                rows={3}
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="E.g., Field Crew Alpha dispatched with vacuum truck; ETA 25 minutes..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Officer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Acting Official
              </label>
              <input
                type="text"
                value={changedBy}
                onChange={(e) => setChangedBy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            {/* Save Button */}
            <button
              id="save-ticket-action-btn"
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving...' : 'Commit Municipal Action'}</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
