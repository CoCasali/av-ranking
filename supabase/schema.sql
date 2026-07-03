create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  team_a uuid[] not null,
  team_b uuid[] not null,
  score_a int not null,
  score_b int not null,
  match_date timestamptz not null,
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null
);

alter table players enable row level security;
alter table matches enable row level security;
alter table settings enable row level security;

create policy "authenticated full access" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on matches
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
