import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports.js';
import insightsRouter from './routes/insights.js';
import seedRouter from './routes/seed.js';
import { db } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MetroShield Municipal Hazard Engine',
    timestamp: new Date().toISOString(),
    gemini_ready: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key'),
    supabase_ready: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://your-supabase-project.supabase.co')
  });
});

// API Routes
app.use('/api/reports', reportsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/seed', seedRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MetroShield Municipal Engine API',
    version: '2.0.0',
    description: 'Autonomous Municipal Hazard Command & City Defense API',
    endpoints: {
      health: 'GET /api/health',
      reports: 'GET /api/reports, POST /api/reports, GET /api/reports/:id, PATCH /api/reports/:id/status',
      clusters: 'GET /api/insights/clusters',
      stats: 'GET /api/insights/stats',
      seed: 'POST /api/seed'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[CivicPulse Server Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal municipal processing error',
    message: err.message
  });
});

// Auto-seed on initial launch so the application has 40 realistic reports out-of-the-box
async function startServer() {
  try {
    await db.seedData();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🛡️ MetroShield Backend Engine running on http://localhost:${PORT}`);
      console.log(`🚀 Automated AI Pipeline & pgvector Triage Ready`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize CivicPulse server:', error);
    process.exit(1);
  }
}

startServer();
