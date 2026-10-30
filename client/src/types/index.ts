export type ReportCategory = 'waterlogging' | 'roads' | 'waste' | 'streetlights' | 'electrical';

export type ReportStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ActivityLog {
  id: string;
  report_id: string;
  previous_status: ReportStatus | null;
  new_status: ReportStatus;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  priority: PriorityLevel;
  priority_score: number;
  ai_summary?: string;
  ai_explanation?: string;
  action_brief?: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  reporter_contact?: string;
  assigned_to?: string | null;
  is_duplicate: boolean;
  parent_duplicate_id?: string | null;
  duplicates?: Report[];
  parent?: Report | null;
  activity_logs?: ActivityLog[];
  created_at: string;
  updated_at: string;
}

export interface ClusterInsight {
  id: string;
  title: string;
  dominant_category: ReportCategory;
  severity: 'Critical' | 'High' | 'Moderate';
  report_count: number;
  max_priority_score: number;
  center: {
    latitude: number;
    longitude: number;
  };
  radius_meters: number;
  category_distribution: Record<string, number>;
  executive_action_brief: string;
  reports: Array<{
    id: string;
    title: string;
    category: ReportCategory;
    priority: PriorityLevel;
    priority_score: number;
    status: ReportStatus;
    latitude: number;
    longitude: number;
    address?: string;
    ai_summary?: string;
  }>;
}

export interface CityStats {
  total_reports: number;
  open_hazards: number;
  critical_alerts: number;
  resolved_count: number;
  duplicate_merged_count: number;
  duplicate_merge_rate_pct: number;
  average_priority_score: number;
  avg_resolution_time_hours: number;
  category_breakdown: Record<ReportCategory, number>;
  status_breakdown: Record<ReportStatus, number>;
}
