-- Fix logs table structure
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

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all logs" ON logs FOR ALL USING (true);

-- Ensure assignments table exists
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  priority TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all assignments" ON assignments FOR ALL USING (true);
