import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

/**
 * POST /api/seed
 * Injects 40 synthetic pre-seeded civic reports with deliberate clusters and duplicates
 */
router.post('/', async (req, res) => {
  try {
    const result = await db.seedData();
    return res.json({
      success: true,
      message: `Successfully seeded database with ${result.count || 40} realistic civic reports.`,
      count: result.count || 40
    });
  } catch (error) {
    console.error('[Seed API] POST /api/seed error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed synthetic civic data',
      message: error.message
    });
  }
});

// Also support GET for quick browser test
router.get('/', async (req, res) => {
  try {
    const result = await db.seedData();
    return res.json({
      success: true,
      message: `Database populated with ${result.count || 40} realistic civic reports.`,
      count: result.count || 40
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
