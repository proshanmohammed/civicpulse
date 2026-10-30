import { db } from '../config/db.js';

async function runSeed() {
  console.log('[CivicPulse] Starting synthetic civic dataset population...');
  try {
    const result = await db.seedData();
    console.log(`[CivicPulse] SUCCESS: Seeded ${result.count || 40} reports with clusters and embeddings.`);
    process.exit(0);
  } catch (err) {
    console.error('[CivicPulse] FAILED to seed data:', err);
    process.exit(1);
  }
}

runSeed();
