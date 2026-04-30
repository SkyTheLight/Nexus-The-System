-- Drop and recreate logs table with correct structure
DROP TABLE IF EXISTS logs;

CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  original_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task','idea','goal','certificate','note','music','dev','performance','assignment')),
  title TEXT,
  description TEXT,
  data JSONB,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all logs" ON logs FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_logs_deleted_at ON logs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
