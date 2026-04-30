-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date date,
  tags text[],
  status text check (status in ('todo', 'in-progress', 'done')) default 'todo',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ideas table
create table if not exists public.ideas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text check (category in ('web', 'mobile', 'saas', 'other')) default 'other',
  status text check (status in ('idea', 'planning', 'building', 'paused', 'done')) default 'idea',
  potential_score integer check (potential_score >= 1 and potential_score <= 10) default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Goals table
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text check (type in ('short', 'long')) default 'short',
  progress integer check (progress >= 0 and progress <= 100) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Certificates table
create table if not exists public.certificates (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  provider text,
  deadline date,
  status text check (status in ('not started', 'studying', 'scheduled', 'completed')) default 'not started',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Notes table
create table if not exists public.notes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  category text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Music table
create table if not exists public.music (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  link text not null,
  vibe text check (vibe in ('hype', 'chill', 'cinematic', 'other')) default 'other',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Dev entries table
create table if not exists public.dev_entries (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text,
  type text check (type in ('snippet', 'prompt', 'note')) default 'note',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Performance entries table
create table if not exists public.performance_entries (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  game text,
  sensitivity text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Dashboard Layout table
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

-- Enable Row Level Security (optional for single-user)
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;
alter table public.goals enable row level security;
alter table public.certificates enable row level security;
alter table public.notes enable row level security;
alter table public.music enable row level security;
alter table public.dev_entries enable row level security;
alter table public.performance_entries enable row level security;
alter table public.dashboard_layout enable row level security;

-- Create policies (drop first if exists, then create)
DO $$
BEGIN
  -- Tasks policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.tasks;
  END IF;
  CREATE POLICY "Allow all" ON public.tasks FOR ALL USING (true);

  -- Ideas policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ideas' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.ideas;
  END IF;
  CREATE POLICY "Allow all" ON public.ideas FOR ALL USING (true);

  -- Goals policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.goals;
  END IF;
  CREATE POLICY "Allow all" ON public.goals FOR ALL USING (true);

  -- Certificates policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.certificates;
  END IF;
  CREATE POLICY "Allow all" ON public.certificates FOR ALL USING (true);

  -- Notes policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.notes;
  END IF;
  CREATE POLICY "Allow all" ON public.notes FOR ALL USING (true);

  -- Music policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'music' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.music;
  END IF;
  CREATE POLICY "Allow all" ON public.music FOR ALL USING (true);

  -- Dev entries policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dev_entries' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.dev_entries;
  END IF;
  CREATE POLICY "Allow all" ON public.dev_entries FOR ALL USING (true);

  -- Performance entries policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'performance_entries' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.performance_entries;
  END IF;
  CREATE POLICY "Allow all" ON public.performance_entries FOR ALL USING (true);

  -- Dashboard layout policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboard_layout' AND policyname = 'Allow all') THEN
    DROP POLICY "Allow all" ON public.dashboard_layout;
  END IF;
  CREATE POLICY "Allow all" ON public.dashboard_layout FOR ALL USING (true);
END $$;

-- Add updated_at triggers
drop trigger if exists handle_updated_at on public.tasks;
create trigger handle_updated_at before update on public.tasks for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.ideas;
create trigger handle_updated_at before update on public.ideas for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.goals;
create trigger handle_updated_at before update on public.goals for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.certificates;
create trigger handle_updated_at before update on public.certificates for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.notes;
create trigger handle_updated_at before update on public.notes for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.music;
create trigger handle_updated_at before update on public.music for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.dev_entries;
create trigger handle_updated_at before update on public.dev_entries for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.performance_entries;
create trigger handle_updated_at before update on public.performance_entries for each row execute function handle_updated_at();

drop trigger if exists handle_updated_at on public.dashboard_layout;
create trigger handle_updated_at before update on public.dashboard_layout for each row execute function handle_updated_at();

-- Insert default widget layouts
insert into public.dashboard_layout (widget_id, x, y, w, h, visible) values
  ('todos', 0, 0, 2, 2, true),
  ('goals', 2, 0, 2, 2, true),
  ('ideas', 4, 0, 2, 2, true),
  ('notes', 0, 2, 2, 2, true),
  ('music', 2, 2, 2, 2, true),
  ('certificates', 4, 2, 2, 2, true),
  ('dev', 0, 4, 2, 2, true),
  ('performance', 2, 4, 2, 2, true),
  ('timeline', 4, 4, 2, 2, true)
on conflict do nothing;
