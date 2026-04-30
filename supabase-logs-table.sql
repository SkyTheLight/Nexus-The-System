-- Create logs table to store deleted items for backup
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('task', 'goal', 'idea', 'certificate', 'note', 'music', 'dev', 'performance')),
  title text NOT NULL,
  description text,
  data jsonb NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create policy for full access (single user system)
CREATE POLICY "Allow all operations" ON public.logs FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_logs_deleted_at ON public.logs(deleted_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_type ON public.logs(type);
