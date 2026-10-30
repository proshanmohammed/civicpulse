import React from 'react';
import { 
  AlertOctagon, 
  Flame, 
  CheckCircle2, 
  GitMerge, 
  Clock, 
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { CityStats } from '../types';

interface MetricsGridProps {
  stats: CityStats | null;
  loading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ stats, loading = false }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-800 animate-pulse">
            <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Critical Safety Alerts',
      value: stats.critical_alerts,
      subtext: 'Immediate life/safety hazards',
      icon: Flame,
      color: 'from-rose-500/20 to-red-600/10 border-rose-500/30 text-rose-400',
      badge: 'Urgent Action',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      title: 'Active Open Hazards',
      value: stats.open_hazards,
      subtext: 'Pending remediation',
      icon: AlertOctagon,
      color: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-400',
      badge: `${stats.total_reports} Total Registered`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      title: 'Semantic Duplicates Merged',
      value: `${stats.duplicate_merge_rate_pct}%`,
      subtext: `${stats.duplicate_merged_count} reports linked via pgvector`,
      icon: GitMerge,
      color: 'from-violet-500/20 to-indigo-600/10 border-violet-500/30 text-violet-400',
      badge: 'Zero Redundancy',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    },
    {
      title: 'Resolved Civic Actions',
      value: stats.resolved_count,
      subtext: `Avg resolution ${stats.avg_resolution_time_hours} hrs`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      badge: 'Verified Cleaned',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-2xl p-5 border bg-gradient-to-br ${card.color} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {card.value}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-snug">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
