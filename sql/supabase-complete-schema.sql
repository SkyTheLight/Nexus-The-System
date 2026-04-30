-- Complete Adversity Database Schema for ARISE
-- Run this entire script in Supabase SQL Editor

-- 1. Todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  potential_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Music table
CREATE TABLE IF NOT EXISTS public.music (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Dev Mode table
CREATE TABLE IF NOT EXISTS public.dev_mode (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Performance Entries table
CREATE TABLE IF NOT EXISTS public.performance_entries (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metric_value DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Dashboard Layout table
CREATE TABLE IF NOT EXISTS public.dashboard_layout (
  id BIGSERIAL PRIMARY KEY,
  widget_id VARCHAR(50) UNIQUE NOT NULL,
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  w INTEGER DEFAULT 2,
  h INTEGER DEFAULT 2,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Logs table (for deleted items)
CREATE TABLE IF NOT EXISTS public.logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  entity_data JSONB,
  action VARCHAR(50) DEFAULT 'delete',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AI Logs table (for ARISE learning)
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id BIGSERIAL PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model VARCHAR(50) DEFAULT 'llama-3.1-8b-instant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (single-user mode - allow all)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for single user)
CREATE POLICY IF NOT EXISTS "Allow all on todos" ON public.todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on ideas" ON public.ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on music" ON public.music FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on dev_mode" ON public.dev_mode FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on performance_entries" ON public.performance_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on dashboard_layout" ON public.dashboard_layout FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on logs" ON public.logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all on ai_logs" ON public.ai_logs FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_logs(created_at DESC);

-- Insert test deadline (optional)
INSERT INTO public.todos (title, description, deadline)
VALUES ('Test Deadline', 'Add test deadline', NOW() + INTERVAL '1 day' + INTERVAL '11 hours' + INTERVAL '59 minutes')
ON CONFLICT DO NOTHING;
