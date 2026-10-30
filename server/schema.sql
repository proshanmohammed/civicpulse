-- ==============================================================================
-- CivicPulse: Production PostgreSQL & Supabase Database Migration
-- Fully compatible with Supabase SQL Editor
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Drop existing objects if refreshing
DROP TABLE IF EXISTS report_activity_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TYPE IF EXISTS report_category CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;

-- 3. Enum types
CREATE TYPE report_category AS ENUM ('waterlogging', 'roads', 'waste', 'streetlights', 'electrical');
CREATE TYPE report_status AS ENUM ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected');
CREATE TYPE priority_level AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- 4. Reports Table
CREATE TABLE reports (
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

-- 5. Audit / Status History Log Table
CREATE TABLE report_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    previous_status report_status,
    new_status report_status,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes for high performance & spatial lookup
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority_score DESC);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_parent_dup ON reports(parent_duplicate_id);
CREATE INDEX idx_activity_report_id ON report_activity_logs(report_id);

-- 7. HNSW Vector Index for Cosine Similarity (Supported out-of-the-box on empty tables in Supabase)
CREATE INDEX idx_reports_embedding ON reports USING hnsw (embedding vector_cosine_ops);

-- 8. Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public report submission" ON reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public report tracking read" ON reports
    FOR SELECT USING (true);

CREATE POLICY "Allow staff update reports" ON reports
    FOR UPDATE USING (true);

CREATE POLICY "Allow public log read" ON report_activity_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow staff insert logs" ON report_activity_logs
    FOR INSERT WITH CHECK (true);

-- 10. RPC: Semantic Duplicate Search Function using Cosine Distance
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
        (1 - (r.embedding <=> query_embedding))::FLOAT AS similarity
    FROM reports r
    WHERE r.embedding IS NOT NULL
      AND 1 - (r.embedding <=> query_embedding) >= match_threshold
    ORDER BY r.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
