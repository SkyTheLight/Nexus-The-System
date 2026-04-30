-- Assignments table for university assignment tracking
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  priority TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (single-user system)
CREATE POLICY "Allow all" ON assignments FOR ALL USING (true);

-- Create index for faster deadline queries
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_completed ON assignments(completed);
