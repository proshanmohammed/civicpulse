import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReportCategory, PriorityLevel, ReportStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function getCategoryBadge(category: ReportCategory) {
  switch (category) {
    case 'waterlogging':
      return {
        label: 'Waterlogging & Drainage',
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400'
      };
    case 'roads':
      return {
        label: 'Roads & Infrastructure',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400'
      };
    case 'waste':
      return {
        label: 'Waste & Sanitation',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    case 'streetlights':
      return {
        label: 'Streetlights & Lighting',
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400'
      };
    case 'electrical':
      return {
        label: 'Electrical Hazards',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400'
      };
  }
}

export function getPriorityBadge(priority: PriorityLevel, score?: number) {
  switch (priority) {
    case 'Critical':
      return {
        label: 'Critical Danger',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        text: 'text-rose-400',
        bar: 'bg-rose-500',
        gradient: 'from-rose-500 to-red-600',
        ring: 'ring-rose-500/30'
      };
    case 'High':
      return {
        label: 'High Priority',
        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        text: 'text-amber-400',
        bar: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-600',
        ring: 'ring-amber-500/30'
      };
    case 'Medium':
      return {
        label: 'Medium Priority',
        bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
        text: 'text-yellow-400',
        bar: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-amber-500',
        ring: 'ring-yellow-500/30'
      };
    case 'Low':
      return {
        label: 'Low Priority',
        bg: 'bg-slate-500/15 text-slate-400 border-slate-500/40',
        text: 'text-slate-400',
        bar: 'bg-slate-500',
        gradient: 'from-slate-500 to-slate-600',
        ring: 'ring-slate-500/30'
      };
  }
}

export function getStatusBadge(status: ReportStatus) {
  switch (status) {
    case 'Submitted':
      return {
        label: 'Submitted',
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400'
      };
    case 'Under Review':
      return {
        label: 'Under Review',
        bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        dot: 'bg-purple-400'
      };
    case 'Assigned':
      return {
        label: 'Assigned',
        bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        dot: 'bg-indigo-400'
      };
    case 'In Progress':
      return {
        label: 'In Progress',
        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400 animate-pulse'
      };
    case 'Resolved':
      return {
        label: 'Resolved',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400'
      };
    case 'Rejected':
      return {
        label: 'Rejected',
        bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400'
      };
  }
}
