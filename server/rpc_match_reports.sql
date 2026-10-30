-- Optional: Semantic Vector Match Function for pgvector
-- Run this in Supabase SQL editor ONLY if you wish to run vector distance in SQL directly.
-- Note: CivicPulse already has native fallback vector calculation in Node.js.

DROP FUNCTION IF EXISTS match_reports;

CREATE FUNCTION match_reports (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.82,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category report_category,
  status report_status,
  priority priority_level,
  priority_score int,
  latitude double precision,
  longitude double precision,
  similarity float
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
    (1 - (r.embedding <=> query_embedding))::float AS similarity
  FROM reports r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> query_embedding) >= match_threshold
  ORDER BY r.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
