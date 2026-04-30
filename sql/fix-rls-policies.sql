-- Fix RLS policies for all tables to allow anonymous access (single-user system)
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS music ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) and create new ones that allow all operations
DROP POLICY IF EXISTS "Allow all" ON tasks;
DROP POLICY IF EXISTS "Allow all" ON goals;
DROP POLICY IF EXISTS "Allow all" ON ideas;
DROP POLICY IF EXISTS "Allow all" ON notes;
DROP POLICY IF EXISTS "Allow all" ON music;
DROP POLICY IF EXISTS "Allow all" ON dev_entries;
DROP POLICY IF EXISTS "Allow all" ON performance_entries;
DROP POLICY IF EXISTS "Allow all" ON certificates;
DROP POLICY IF EXISTS "Allow all" ON assignments;

-- Create policies that allow all operations (single-user system)
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON music FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON dev_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON performance_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON certificates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON assignments FOR ALL USING (true) WITH CHECK (true);

-- Grant access to anon role
GRANT ALL ON tasks TO anon;
GRANT ALL ON goals TO anon;
GRANT ALL ON ideas TO anon;
GRANT ALL ON notes TO anon;
GRANT ALL ON music TO anon;
GRANT ALL ON dev_entries TO anon;
GRANT ALL ON performance_entries TO anon;
GRANT ALL ON certificates TO anon;
GRANT ALL ON assignments TO anon;
