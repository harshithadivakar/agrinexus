-- Per-plant water/light/pH state for the garden grid feature.
-- Mirrors the existing `gardens` table's pattern (one row per user, RLS by user_id),
-- but one row per (user, plant) instead of one row per user, since the grid shows
-- several plants at once, each independently controllable.
--
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/_/sql/new

create table if not exists public.plant_conditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id text not null,
  water_level text not null default 'optimal' check (water_level in ('optimal', 'low', 'critical')),
  light_status text not null default 'on_schedule' check (light_status in ('on_schedule', 'off')),
  ph_status text not null default 'steady' check (ph_status in ('steady', 'high', 'low')),
  updated_at timestamptz not null default now(),
  unique (user_id, plant_id)
);

alter table public.plant_conditions enable row level security;

-- Users can only ever see/change their own plants' conditions.
create policy "Users can view their own plant conditions"
  on public.plant_conditions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own plant conditions"
  on public.plant_conditions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plant conditions"
  on public.plant_conditions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own plant conditions"
  on public.plant_conditions for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every change, matching common Supabase convention.
create or replace function public.set_plant_conditions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_plant_conditions_updated_at on public.plant_conditions;
create trigger trg_plant_conditions_updated_at
  before update on public.plant_conditions
  for each row execute function public.set_plant_conditions_updated_at();
