-- Enable Supabase Realtime for all tables
-- Run this in Supabase SQL Editor

BEGIN;

-- Enable replication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE music;
ALTER PUBLICATION supabase_realtime ADD TABLE dev_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_logs;

COMMIT;
