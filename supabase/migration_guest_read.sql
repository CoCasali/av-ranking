create policy "public read access" on players
  for select using (true);

create policy "public read access" on matches
  for select using (true);

create policy "public read access" on settings
  for select using (true);
