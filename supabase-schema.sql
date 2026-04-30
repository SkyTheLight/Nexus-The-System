-- Supabase Database Schema for Adversity Personal Command Center

-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

-- Enable Row Level Security (optional for single-user, but good practice)
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;
alter table public.goals enable row level security;
alter table public.certificates enable row level security;
alter table public.notes enable row level security;
alter table public.music enable row level security;
alter table public.dev_entries enable row level security;
alter table public.performance_entries enable row level security;

-- Create policies to allow all operations (for single-user local use)
create policy "Allow all" on public.tasks for all using (true);
create policy "Allow all" on public.ideas for all using (true);
create policy "Allow all" on public.goals for all using (true);
create policy "Allow all" on public.certificates for all using (true);
create policy "Allow all" on public.notes for all using (true);
create policy "Allow all" on public.music for all using (true);
create policy "Allow all" on public.dev_entries for all using (true);
create policy "Allow all" on public.performance_entries for all using (true);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger handle_updated_at before update on public.tasks for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.ideas for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.goals for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.certificates for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.notes for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.music for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.dev_entries for each row execute function handle_updated_at();
create trigger handle_updated_at before update on public.performance_entries for each row execute function handle_updated_at();
