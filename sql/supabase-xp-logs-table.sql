-- Table to track XP gains in Supabase (optional - currently using localStorage)
CREATE TABLE IF NOT EXISTS xp_logs (
  id BIGSERIAL PRIMARY KEY,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON xp_logs FOR ALL USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at ON xp_logs(created_at);
