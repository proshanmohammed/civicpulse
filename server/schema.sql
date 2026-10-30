-- ==============================================================================
-- CivicPulse: Production PostgreSQL & Supabase Database Migration
-- Single-Query Compatible (Can be run all together or individually)
-- ==============================================================================

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- Drop old tables if refreshing
DROP TABLE IF EXISTS report_activity_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('waterlogging', 'roads', 'waste', 'streetlights', 'electrical')),
    status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100),
    ai_summary TEXT,
    ai_explanation TEXT,
    action_brief TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    image_url TEXT,
    reporter_contact TEXT,
    assigned_to TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    parent_duplicate_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit / Status History Log Table
CREATE TABLE report_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance & spatial lookup
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(latitude, longitude);

-- Row Level Security (RLS) Configuration
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public report submission" ON reports;
CREATE POLICY "Allow public report submission" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public report tracking read" ON reports;
CREATE POLICY "Allow public report tracking read" ON reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow staff update reports" ON reports;
CREATE POLICY "Allow staff update reports" ON reports FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public log read" ON report_activity_logs;
CREATE POLICY "Allow public log read" ON report_activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow staff insert logs" ON report_activity_logs;
CREATE POLICY "Allow staff insert logs" ON report_activity_logs FOR INSERT WITH CHECK (true);
