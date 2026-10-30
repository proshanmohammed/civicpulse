import express from 'express';
import { z } from 'zod';
import { db } from '../config/db.js';
import { generateAIAnalysis, generateTextEmbedding } from '../services/gemini.js';

const router = express.Router();

// Zod Schema Validation as specified in Section 16
export const createReportSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  category: z.enum(['waterlogging', 'roads', 'waste', 'streetlights', 'electrical']).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  image_url: z.string().url().optional().or(z.literal('')).or(z.null()),
  reporter_contact: z.string().optional().or(z.literal('')),
  address: z.string().optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  priority_score: z.number().min(0).max(100).optional(),
  changed_by: z.string().optional()
});

/**
 * POST /api/reports
 * Citizen report submission with automated Gemini AI processing pipeline
 */
router.post('/', async (req, res) => {
  try {
    const parseResult = createReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { description, category: userCategory, latitude, longitude, image_url, reporter_contact, address } = parseResult.data;

    // 1. Generate vector embedding for semantic duplicate detection
    const embedding = await generateTextEmbedding(description);

    // 2. Query vector store for potential semantic duplicates
    const duplicateMatches = await db.findSemanticDuplicates(embedding, 0.82, 3);
    const topDuplicate = duplicateMatches.length > 0 ? duplicateMatches[0] : null;
    const isDuplicate = Boolean(topDuplicate && topDuplicate.similarity >= 0.85);

    // 3. Run Gemini AI Analysis (categorize, summarize, prioritize, explain, action brief)
    const aiAnalysis = await generateAIAnalysis(description, userCategory);

    // 4. Construct production record
    const reportRecord = {
      title: aiAnalysis.summary,
      description,
      category: aiAnalysis.category,
      status: 'Submitted',
      priority: aiAnalysis.priority_level,
      priority_score: aiAnalysis.priority_score,
      ai_summary: aiAnalysis.summary,
      ai_explanation: aiAnalysis.explanation,
      action_brief: aiAnalysis.action_brief,
      latitude,
      longitude,
      address: address || `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`,
      image_url: image_url || null,
      reporter_contact: reporter_contact || null,
      assigned_to: null,
      is_duplicate: isDuplicate,
      parent_duplicate_id: isDuplicate ? topDuplicate.id : null,
      embedding
    };

    // 5. Persist to database
    const savedReport = await db.createReport(reportRecord);

    return res.status(201).json({
      success: true,
      data: savedReport,
      ai_metadata: {
        detected_duplicates: duplicateMatches,
        is_duplicate: isDuplicate,
        parent_id: isDuplicate ? topDuplicate.id : null
      }
    });
  } catch (error) {
    console.error('[Reports API] POST /api/reports error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing civic report',
      message: error.message
    });
  }
});

/**
 * GET /api/reports
 * Query reports with filtering (status, category, priority, search)
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const reports = await db.getAllReports({ status, category, priority, search });

    return res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('[Reports API] GET /api/reports error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

/**
 * GET /api/reports/:id
 * Fetch single report detail, duplicates, and audit history
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await db.getReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error(`[Reports API] GET /api/reports/${req.params.id} error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve report'
    });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Administrative action workflow: status update, worker assignment, notes
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const parseResult = updateStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const updated = await db.updateReportStatus(id, parseResult.data);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    return res.json({
      success: true,
      message: `Report #${id} status updated to ${parseResult.data.status}`,
      data: updated
    });
  } catch (error) {
    console.error(`[Reports API] PATCH /api/reports/${req.params.id}/status error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update report status'
    });
  }
});

export default router;
