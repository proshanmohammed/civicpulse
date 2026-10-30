import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown, 
  UserCheck, 
  GitMerge, 
  ExternalLink, 
  Sparkles, 
  Check, 
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Report, ReportStatus, ReportCategory, PriorityLevel } from '../types';
import { getCategoryBadge, getPriorityBadge, getStatusBadge, formatTimeAgo } from '../lib/utils';
import { updateReportStatus } from '../lib/api';

interface AdminQueueTableProps {
  reports: Report[];
  onReportUpdated?: (updated: Report) => void;
  onOpenActionBrief?: (report: Report) => void;
}

const FIELD_CREWS = [
  'Field Crew Alpha (Water & Drainage)',
  'Rapid Response Grid Squad 1',
  'Road Maintenance Crew 7',
  'Sanitation Sector 4 Crew',
  'Lighting Tech Team 3',
  'Hazmat Emergency Unit'
];

export const AdminQueueTable: React.FC<AdminQueueTableProps> = ({
  reports,
  onReportUpdated,
  onOpenActionBrief
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'priority_score' | 'created_at'>('priority_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Quick Assignment state
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const filtered = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority_score') {
      return sortOrder === 'desc' 
        ? b.priority_score - a.priority_score 
        : a.priority_score - b.priority_score;
    } else {
      return sortOrder === 'desc'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });

  const handleQuickStatusAdvance = async (report: Report) => {
    let nextStatus: ReportStatus = 'Under Review';
    if (report.status === 'Submitted') nextStatus = 'Under Review';
    else if (report.status === 'Under Review') nextStatus = 'Assigned';
    else if (report.status === 'Assigned') nextStatus = 'In Progress';
    else if (report.status === 'In Progress') nextStatus = 'Resolved';
    else return;

    try {
      setUpdatingId(report.id);
      const updated = await updateReportStatus(report.id, {
        status: nextStatus,
        assigned_to: report.assigned_to || FIELD_CREWS[0],
        notes: `Quick triage advanced to ${nextStatus} via authority queue table.`
      });
      if (onReportUpdated) onReportUpdated(updated);
    } catch (err) {
      console.error('Quick update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignCrew = async (report: Report, crew: string) => {
    try {
      setUpdatingId(report.id);
      const updated = await updateReportStatus(report.id, {
        status: report.status === 'Submitted' ? 'Assigned' : report.status,
        assigned_to: crew,
        notes: `Dispatched to ${crew}.`
      });
      setAssigningId(null);
      if (onReportUpdated) onReportUpdated(updated);
    } catch (err) {
      console.error('Assignment failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      
      {/* Table Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="admin-search-input"
            type="text"
            placeholder="Search grievances by keyword, address, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            id="admin-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            id="admin-filter-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="roads">Roads</option>
            <option value="waste">Waste</option>
            <option value="streetlights">Streetlights</option>
            <option value="electrical">Electrical</option>
          </select>

          <select
            id="admin-filter-priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical (90-100)</option>
            <option value="High">High (70-89)</option>
            <option value="Medium">Medium (40-69)</option>
            <option value="Low">Low (0-39)</option>
          </select>

          <button
            onClick={() => {
              if (sortBy === 'priority_score') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('priority_score');
                setSortOrder('desc');
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 font-medium"
            title="Sort by Priority Score"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sort Score {sortBy === 'priority_score' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
          </button>
        </div>

      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Priority & Score</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 min-w-[240px]">Civic Issue & Address</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Crew</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4 text-right">Triage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  No grievances match the specified criteria.
                </td>
              </tr>
            ) : (
              sorted.map((report) => {
                const prio = getPriorityBadge(report.priority, report.priority_score);
                const cat = getCategoryBadge(report.category);
                const stat = getStatusBadge(report.status);
                const isWorking = updatingId === report.id;

                return (
                  <tr 
                    key={report.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Priority & Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded font-mono font-bold border text-[11px] ${prio.bg}`}>
                          {report.priority_score}
                        </div>
                        <span className={`font-semibold hidden sm:inline ${prio.text}`}>
                          {report.priority}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${cat.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                        {cat.label.split('&')[0].trim()}
                      </span>
                    </td>

                    {/* Title, Address, and Duplicate Flag */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link 
                            to={`/admin/reports/${report.id}`}
                            className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1"
                          >
                            {report.title}
                          </Link>
                          {report.is_duplicate && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                              <GitMerge className="w-2.5 h-2.5" />
                              Merged
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] truncate max-w-sm">
                          {report.address || 'Address not pinned'}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${stat.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                        {stat.label}
                      </span>
                    </td>

                    {/* Assigned Crew */}
                    <td className="py-3 px-4 whitespace-nowrap relative">
                      {assigningId === report.id ? (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl space-y-1 min-w-[220px]">
                          <div className="text-[10px] text-slate-400 font-semibold px-1">SELECT FIELD CREW:</div>
                          {FIELD_CREWS.map((crew) => (
                            <button
                              key={crew}
                              onClick={() => handleAssignCrew(report, crew)}
                              className="w-full text-left px-2 py-1 text-xs text-slate-200 hover:bg-indigo-600 rounded-lg transition-colors truncate"
                            >
                              {crew}
                            </button>
                          ))}
                          <button
                            onClick={() => setAssigningId(null)}
                            className="w-full text-center text-[10px] text-slate-400 hover:text-slate-200 pt-1 border-t border-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(report.id)}
                          className="flex items-center gap-1 text-slate-300 hover:text-indigo-400 text-xs font-medium"
                          title="Click to assign field crew"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate max-w-[130px]">
                            {report.assigned_to || 'Unassigned (Assign)'}
                          </span>
                        </button>
                      )}
                    </td>

                    {/* Age */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatTimeAgo(report.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick AI Action Brief Modal */}
                        {onOpenActionBrief && (
                          <button
                            onClick={() => onOpenActionBrief(report)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all"
                            title="AI Action Brief"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Advance Status */}
                        {report.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickStatusAdvance(report)}
                            disabled={isWorking}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-[11px] font-medium transition-all border border-slate-700 flex items-center gap-1"
                            title="Advance to next lifecycle step"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Advance</span>
                          </button>
                        )}

                        {/* Full Detail Link */}
                        <Link
                          to={`/admin/reports/${report.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                          title="Open Action Console"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="p-3 border-t border-slate-800 bg-[#070b14] text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {sorted.length} of {reports.length} total municipal reports</span>
        <span className="font-mono text-[11px] text-emerald-400 font-semibold">MetroShield Vector Triaged</span>
      </div>

    </div>
  );
};
