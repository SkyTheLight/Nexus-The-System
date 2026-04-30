-- AI Conversation Logs table
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id BIGSERIAL PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model VARCHAR(50) DEFAULT 'llama-3.1-8b-instant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single user)
CREATE POLICY "Allow all operations on ai_logs" ON public.ai_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_logs(created_at DESC);
