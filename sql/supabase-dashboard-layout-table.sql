-- Dashboard layout table for saving widget positions
CREATE TABLE IF NOT EXISTS dashboard_layout (
  id BIGSERIAL PRIMARY KEY,
  widget_id TEXT UNIQUE NOT NULL,
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  w INTEGER DEFAULT 2,
  h INTEGER DEFAULT 2,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (single-user system)
CREATE POLICY "Allow all" ON dashboard_layout FOR ALL USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_widget_id ON dashboard_layout(widget_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_y ON dashboard_layout(y);

-- Insert default widgets if table is empty
INSERT INTO dashboard_layout (widget_id, x, y, w, h, visible)
VALUES 
  ('todos', 0, 0, 2, 2, true),
  ('goals', 2, 0, 2, 2, true),
  ('ideas', 4, 0, 2, 2, true),
  ('notes', 0, 2, 2, 2, true),
  ('music', 2, 2, 2, 2, true),
  ('certificates', 4, 2, 2, 2, true),
  ('dev', 0, 4, 2, 2, true),
  ('performance', 2, 4, 2, 2, true),
  ('timeline', 4, 4, 2, 2, true),
  ('github', 0, 6, 3, 2, true),
  ('assignments', 3, 6, 3, 2, true)
ON CONFLICT (widget_id) DO NOTHING;
