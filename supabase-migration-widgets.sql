-- Add Google OAuth fields to users table (if using custom users table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMPTZ;

-- User sites table (for custom site buttons)
CREATE TABLE IF NOT EXISTS user_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User site order table (for drag-and-drop order)
CREATE TABLE IF NOT EXISTS user_site_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screen time sessions table
CREATE TABLE IF NOT EXISTS screen_time_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  active_ms BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Manual site time table
CREATE TABLE IF NOT EXISTS manual_site_time (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for simplicity (or enable and add policies as needed)
ALTER TABLE user_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_site_order DISABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_site_time DISABLE ROW LEVEL SECURITY;
