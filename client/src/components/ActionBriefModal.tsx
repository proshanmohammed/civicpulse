import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Wrench, 
  GitMerge, 
  MapPin, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Report } from '../types';
import { getPriorityBadge, getCategoryBadge, getStatusBadge } from '../lib/utils';

interface ActionBriefModalProps {
  report: Report | null;
  onClose: () => void;
}

export const ActionBriefModal: React.FC<ActionBriefModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const prio = getPriorityBadge(report.priority, report.priority_score);
  const cat = getCategoryBadge(report.category);
  const status = getStatusBadge(report.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden bg-[#0e1628] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Municipal Action Brief
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Automated triage & field directives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Priority & Category Banner */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${prio.bg}`}>
                {report.priority_score}/100 · {report.priority}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${cat.bg}`}>
                {cat.label}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg}`}>
              {status.label}
            </span>
          </div>

          {/* Grievance Title */}
          <div>
            <h4 className="text-base font-bold text-white leading-snug">
              {report.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{report.address || 'Address coordinate'}</span>
            </div>
          </div>

          {/* AI Field Worker Directive Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/30 shadow-inner space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              Field Crew Action Directive
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {report.action_brief || 'Deploy municipal inspection team to evaluate site and execute immediate containment.'}
            </p>
          </div>

          {/* Plain-Language Explainability Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Explainable Prioritization Rationale
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.ai_explanation || `Scored ${report.priority_score}/100 based on safety hazards, structural exposure, and pedestrian traffic volume.`}
            </p>
          </div>

          {/* Duplicate Linking Information */}
          {report.is_duplicate && (
            <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-start gap-2.5">
              <GitMerge className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-violet-300 block">
                  Semantic Duplicate Consolidator
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Linked to parent grievance #{report.parent_duplicate_id?.slice(0, 8)}... to avoid dual crew dispatches.
                </p>
              </div>
            </div>
          )}

          {/* Assigned Crew Info */}
          {report.assigned_to && (
            <div className="flex items-center justify-between text-xs text-slate-300 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Assigned Operational Unit:</span>
              <span className="font-bold text-white">{report.assigned_to}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Close
          </button>

          <Link
            to={`/admin/reports/${report.id}`}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Open Ticket Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
