import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Car, 
  Trash2, 
  Lightbulb, 
  Zap, 
  MapPin, 
  Clock, 
  Copy, 
  ExternalLink,
  GitMerge,
  ShieldCheck
} from 'lucide-react';
import { Report } from '../types';
import { getCategoryBadge, getPriorityBadge, getStatusBadge, formatTimeAgo } from '../lib/utils';

interface ReportCardProps {
  report: Report;
  isAdmin?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, isAdmin = false }) => {
  const catBadge = getCategoryBadge(report.category);
  const prioBadge = getPriorityBadge(report.priority, report.priority_score);
  const statusBadge = getStatusBadge(report.status);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'waterlogging': return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case 'roads': return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case 'waste': return <Trash2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'streetlights': return <Lightbulb className="w-3.5 h-3.5 text-purple-400" />;
      case 'electrical': return <Zap className="w-3.5 h-3.5 text-rose-400" />;
      default: return <Droplet className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const targetLink = isAdmin ? `/admin/reports/${report.id}` : `/report/success/${report.id}`;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-slate-800/90 relative group overflow-hidden">
      
      {/* Top accent line based on priority */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${prioBadge.gradient}`} />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${catBadge.bg}`}>
              {getCategoryIcon(report.category)}
              <span>{catBadge.label.split('&')[0].trim()}</span>
            </span>

            {/* Duplicate Flag */}
            {report.is_duplicate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                <GitMerge className="w-3 h-3" />
                Duplicate Merged
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Priority Score Meter */}
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${prioBadge.bg}`}>
              <span>{report.priority_score}</span>
              <span className="text-[9px] opacity-70">/100</span>
            </div>

            {/* Status */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={targetLink} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug line-clamp-2 mb-1.5">
            {report.title}
          </h3>
        </Link>

        {/* Description or AI Summary */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {report.ai_summary || report.description}
        </p>

        {/* Optional Image Preview */}
        {report.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden h-28 w-full border border-slate-800 bg-slate-900/50 relative">
            <img 
              src={report.image_url} 
              alt={report.title} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                // Hide container if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-1 truncate max-w-[65%]">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{report.address || 'Geo-coordinate'}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-slate-500 font-mono">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(report.created_at)}
          </span>
          <Link
            to={targetLink}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600 transition-all"
            title="Inspect Ticket"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
};
