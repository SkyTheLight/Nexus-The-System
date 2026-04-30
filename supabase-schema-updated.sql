-- Add to existing supabase-schema.sql

-- Dashboard Layout table for saving widget positions
create table if not exists public.dashboard_layout (
  id uuid default uuid_generate_v4() primary key,
  widget_id text not null,
  x integer not null default 0,
  y integer not null default 0,
  w integer not null default 2,
  h integer not null default 2,
  visible boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.dashboard_layout enable row level security;
create policy "Allow all" on public.dashboard_layout for all using (true);

-- Add updated_at trigger
create trigger handle_updated_at before update on public.dashboard_layout for each row execute function handle_updated_at();

-- Insert default widget layouts
insert into public.dashboard_layout (widget_id, x, y, w, h, visible) values
  ('todos', 0, 0, 2, 2, true),
  ('goals', 2, 0, 2, 2, true),
  ('ideas', 4, 0, 2, 2, true),
  ('notes', 0, 2, 2, 2, true),
  ('certificates', 2, 2, 2, 2, true),
  ('music', 4, 2, 2, 2, true),
  ('dev', 0, 4, 2, 2, true),
  ('performance', 2, 4, 2, 2, true),
  ('timeline', 4, 4, 2, 2, true)
on conflict do nothing;
