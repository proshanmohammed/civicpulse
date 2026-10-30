import { Report, ClusterInsight, CityStats } from '../types';

const API_BASE = '/api';

export async function fetchReports(params: {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
} = {}): Promise<Report[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
  if (params.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  const json = await res.json();
  return json.data || [];
}

export async function fetchReportById(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report details');
  const json = await res.json();
  return json.data;
}

export async function createReport(payload: {
  description: string;
  category?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  reporter_contact?: string;
  address?: string;
}): Promise<{ data: Report; ai_metadata: any }> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to submit report');
  }
  return json;
}

export async function updateReportStatus(
  id: string,
  payload: {
    status: string;
    assigned_to?: string;
    notes?: string;
    priority?: string;
    priority_score?: number;
    changed_by?: string;
  }
): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update status');
  }
  return json.data;
}

export async function fetchClusters(): Promise<ClusterInsight[]> {
  const res = await fetch(`${API_BASE}/insights/clusters`);
  if (!res.ok) throw new Error('Failed to fetch spatial clusters');
  const json = await res.json();
  return json.data || [];
}

export async function fetchStats(): Promise<CityStats> {
  const res = await fetch(`${API_BASE}/insights/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data;
}

export async function seedData(): Promise<{ message: string; count: number }> {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed synthetic dataset');
  return res.json();
}
