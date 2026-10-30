import { supabase, isSupabaseConfigured } from './supabase.js';
import { seedReports } from '../data/seedData.js';
import { generateFallbackEmbedding, calculateCosineSimilarity } from '../services/gemini.js';
import { randomUUID } from 'crypto';

// In-memory persistent state for local development / zero-setup mode
class LocalCivicStore {
  constructor() {
    this.reports = [];
    this.activityLogs = [];
    this.isInitialized = false;
  }

  async init(forceReset = false) {
    if (this.isInitialized && !forceReset) return;
    this.reports = [];
    this.activityLogs = [];

    // Initialize with seed data and precomputed embeddings
    for (const report of seedReports) {
      const embedding = generateFallbackEmbedding(report.title + ' ' + report.description);
      const record = {
        ...report,
        id: report.id || randomUUID(),
        embedding,
        created_at: report.created_at || new Date().toISOString(),
        updated_at: report.created_at || new Date().toISOString()
      };
      this.reports.push(record);

      // Create initial activity log
      this.activityLogs.push({
        id: randomUUID(),
        report_id: record.id,
        previous_status: null,
        new_status: 'Submitted',
        changed_by: 'System / Citizen Submission',
        notes: 'Initial civic report registered via CivicPulse portal.',
        created_at: record.created_at
      });

      // If status has progressed, add relevant progression log
      if (record.status !== 'Submitted') {
        this.activityLogs.push({
          id: randomUUID(),
          report_id: record.id,
          previous_status: 'Submitted',
          new_status: record.status,
          changed_by: record.assigned_to || 'Municipal Dispatch',
          notes: `Status advanced to ${record.status}. Assigned to ${record.assigned_to || 'Unassigned'}.`,
          created_at: new Date(new Date(record.created_at).getTime() + 3600000).toISOString()
        });
      }
    }

    this.isInitialized = true;
    console.log(`[Local Store] Initialized with ${this.reports.length} reports and ${this.activityLogs.length} activity logs.`);
  }

  async getAllReports(filters = {}) {
    await this.init();
    let results = [...this.reports];

    if (filters.category && filters.category !== 'all') {
      results = results.filter(r => r.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      results = results.filter(r => r.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      results = results.filter(r => r.priority === filters.priority);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.address && r.address.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

    // Sort by created_at DESC by default
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return results;
  }

  async getReportById(id) {
    await this.init();
    const report = this.reports.find(r => r.id === id);
    if (!report) return null;

    // Find duplicates linked to this report
    const duplicates = this.reports.filter(r => r.parent_duplicate_id === id);

    // Find parent if this is a duplicate
    const parent = report.parent_duplicate_id 
      ? this.reports.find(r => r.id === report.parent_duplicate_id) 
      : null;

    // Find activity logs
    const logs = this.activityLogs
      .filter(l => l.report_id === id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      ...report,
      duplicates,
      parent,
      activity_logs: logs
    };
  }

  async createReport(reportData) {
    await this.init();
    const id = reportData.id || randomUUID();
    const now = new Date().toISOString();
    const newReport = {
      ...reportData,
      id,
      status: reportData.status || 'Submitted',
      priority: reportData.priority || 'Medium',
      priority_score: reportData.priority_score ?? 50,
      is_duplicate: reportData.is_duplicate || false,
      parent_duplicate_id: reportData.parent_duplicate_id || null,
      created_at: now,
      updated_at: now
    };

    this.reports.unshift(newReport);

    // Record activity log
    this.activityLogs.push({
      id: randomUUID(),
      report_id: id,
      previous_status: null,
      new_status: 'Submitted',
      changed_by: 'Citizen Submission',
      notes: newReport.is_duplicate 
        ? `Report registered and semantically linked as duplicate of #${newReport.parent_duplicate_id}.`
        : 'Initial report successfully registered via CivicPulse portal.',
      created_at: now
    });

    return newReport;
  }

  async updateReportStatus(id, updateData) {
    await this.init();
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = this.reports[index];
    const previous_status = current.status;
    const new_status = updateData.status || previous_status;
    const now = new Date().toISOString();

    const updated = {
      ...current,
      ...updateData,
      status: new_status,
      updated_at: now
    };

    this.reports[index] = updated;

    // Log activity
    const logEntry = {
      id: randomUUID(),
      report_id: id,
      previous_status,
      new_status,
      changed_by: updateData.changed_by || updateData.assigned_to || 'City Municipal Staff',
      notes: updateData.notes || `Report transitioned from ${previous_status} to ${new_status}.`,
      created_at: now
    };
    this.activityLogs.push(logEntry);

    return {
      ...updated,
      activity_logs: this.activityLogs.filter(l => l.report_id === id)
    };
  }

  async findSemanticDuplicates(queryEmbedding, threshold = 0.80, limit = 5) {
    await this.init();
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) return [];

    const matches = [];
    for (const report of this.reports) {
      if (!report.embedding) continue;
      const similarity = calculateCosineSimilarity(queryEmbedding, report.embedding);
      if (similarity >= threshold) {
        matches.push({
          id: report.id,
          title: report.title,
          description: report.description,
          category: report.category,
          status: report.status,
          priority: report.priority,
          priority_score: report.priority_score,
          latitude: report.latitude,
          longitude: report.longitude,
          similarity: Number(similarity.toFixed(4))
        });
      }
    }

    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async resetAndSeed() {
    await this.init(true);
    return { count: this.reports.length };
  }
}

const localStore = new LocalCivicStore();

// ==============================================================================
// UNIFIED DATABASE ADAPTER
// Bridges seamlessly between Supabase and Local Persistent Store
// ==============================================================================
export const db = {
  async getAllReports(filters) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.priority && filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
        }
        const { data, error } = await query;
        if (!error && data) return data;
        console.warn('[Supabase] getAllReports query failed, falling back to local store:', error?.message);
      } catch (err) {
        console.warn('[Supabase] Connection exception, falling back to local store:', err.message);
      }
    }
    return localStore.getAllReports(filters);
  },

  async getReportById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data: report, error } = await supabase.from('reports').select('*').eq('id', id).single();
        if (!error && report) {
          const { data: duplicates } = await supabase.from('reports').select('*').eq('parent_duplicate_id', id);
          const { data: logs } = await supabase.from('report_activity_logs').select('*').eq('report_id', id).order('created_at', { ascending: true });
          let parent = null;
          if (report.parent_duplicate_id) {
            const { data: parentData } = await supabase.from('reports').select('*').eq('id', report.parent_duplicate_id).single();
            parent = parentData;
          }
          return {
            ...report,
            duplicates: duplicates || [],
            parent,
            activity_logs: logs || []
          };
        }
      } catch (err) {
        console.warn('[Supabase] getReportById exception, falling back:', err.message);
      }
    }
    return localStore.getReportById(id);
  },

  async createReport(reportData) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('reports').insert([reportData]).select().single();
        if (!error && data) {
          // Insert initial activity log
          await supabase.from('report_activity_logs').insert([{
            report_id: data.id,
            previous_status: null,
            new_status: 'Submitted',
            changed_by: 'Citizen Submission',
            notes: data.is_duplicate 
              ? `Report registered and semantically linked as duplicate of #${data.parent_duplicate_id}.`
              : 'Initial report successfully registered via CivicPulse portal.'
          }]);
          return data;
        }
        console.warn('[Supabase] createReport failed, falling back to local store:', error?.message);
      } catch (err) {
        console.warn('[Supabase] createReport exception, falling back:', err.message);
      }
    }
    return localStore.createReport(reportData);
  },

  async updateReportStatus(id, updateData) {
    if (isSupabaseConfigured) {
      try {
        const { data: current } = await supabase.from('reports').select('status').eq('id', id).single();
        const prevStatus = current ? current.status : 'Submitted';
        const { data, error } = await supabase
          .from('reports')
          .update({
            status: updateData.status,
            assigned_to: updateData.assigned_to,
            priority: updateData.priority,
            priority_score: updateData.priority_score,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          await supabase.from('report_activity_logs').insert([{
            report_id: id,
            previous_status: prevStatus,
            new_status: updateData.status,
            changed_by: updateData.changed_by || updateData.assigned_to || 'City Municipal Staff',
            notes: updateData.notes || `Report transitioned from ${prevStatus} to ${updateData.status}.`
          }]);
          return data;
        }
      } catch (err) {
        console.warn('[Supabase] updateReportStatus exception, falling back:', err.message);
      }
    }
    return localStore.updateReportStatus(id, updateData);
  },

  async findSemanticDuplicates(queryEmbedding, threshold = 0.80, limit = 5) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('match_reports', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit
        });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase] match_reports rpc exception, using local vector matcher:', err.message);
      }
    }
    return localStore.findSemanticDuplicates(queryEmbedding, threshold, limit);
  },

  async seedData() {
    if (isSupabaseConfigured) {
      try {
        console.log('[Supabase] Seeding database with 40 synthetic reports...');
        const reportsToInsert = seedReports.map(r => ({
          ...r,
          embedding: generateFallbackEmbedding(r.title + ' ' + r.description)
        }));
        await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const { data, error } = await supabase.from('reports').insert(reportsToInsert).select();
        if (!error) {
          console.log(`[Supabase] Successfully seeded ${data?.length} reports.`);
          return { count: data?.length };
        }
        console.warn('[Supabase] Seed insertion failed, falling back to local store:', error.message);
      } catch (err) {
        console.warn('[Supabase] Seed exception, falling back to local store:', err.message);
      }
    }
    return localStore.resetAndSeed();
  }
};
