-- ==============================================================================
-- CivicPulse: Production PostgreSQL & Supabase Database Migration
-- Includes: pgvector, UUID extensions, Enums, Tables, RLS, Indexes, RPC Search
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE report_category AS ENUM ('waterlogging', 'roads', 'waste', 'streetlights', 'electrical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('Critical', 'High', 'Medium', 'Low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    status report_status DEFAULT 'Submitted'::report_status,
    priority priority_level DEFAULT 'Medium'::priority_level,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit / Status History Log Table
CREATE TABLE IF NOT EXISTS report_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    previous_status report_status,
    new_status report_status,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high-performance querying & spatial lookup
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_parent_dup ON reports(parent_duplicate_id);
CREATE INDEX IF NOT EXISTS idx_activity_report_id ON report_activity_logs(report_id);

-- Approximate Nearest Neighbor Index for Cosine Similarity (pgvector)
-- Note: ivfflat index requires existing rows or can be added after seeding
CREATE INDEX IF NOT EXISTS idx_reports_embedding 
    ON reports USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Configuration
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public can insert new reports (citizen submission)
DROP POLICY IF EXISTS "Allow public report submission" ON reports;
CREATE POLICY "Allow public report submission" ON reports
    FOR INSERT WITH CHECK (true);

-- 2. Public can read reports for public tracking and dashboard
DROP POLICY IF EXISTS "Allow public report tracking read" ON reports;
CREATE POLICY "Allow public report tracking read" ON reports
    FOR SELECT USING (true);

-- 3. Staff and Admins can update reports (status, worker assignment, priority)
DROP POLICY IF EXISTS "Allow staff update reports" ON reports;
CREATE POLICY "Allow staff update reports" ON reports
    FOR UPDATE USING (true);

-- 4. Activity Logs RLS: Public can view timeline logs
DROP POLICY IF EXISTS "Allow public log read" ON report_activity_logs;
CREATE POLICY "Allow public log read" ON report_activity_logs
    FOR SELECT USING (true);

-- 5. Staff and System can insert activity logs
DROP POLICY IF EXISTS "Allow staff insert logs" ON report_activity_logs;
CREATE POLICY "Allow staff insert logs" ON report_activity_logs
    FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- RPC: Semantic Duplicate Search Function using Cosine Distance
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_reports(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.82,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category report_category,
    status report_status,
    priority priority_level,
    priority_score INT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.priority,
        r.priority_score,
        r.latitude,
        r.longitude,
        1 - (r.embedding <=> query_embedding) AS similarity
    FROM reports r
    WHERE r.embedding IS NOT NULL
      AND 1 - (r.embedding <=> query_embedding) >= match_threshold
    ORDER BY r.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
