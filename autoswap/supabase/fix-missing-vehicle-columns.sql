-- Run this in the Supabase SQL Editor.
--
-- Why: this project's `vehicles` table was created from an earlier schema.sql
-- and the additive columns were never applied, so saving a listing failed with
--   "Could not find the 'engine_size' column of 'vehicles' in the schema cache"
--
-- These are exactly the `alter table` lines already in supabase/schema.sql;
-- every one is `if not exists`, so running it twice is harmless.

alter table public.vehicles add column if not exists estimated_value int;
alter table public.vehicles add column if not exists engine_size     numeric(3,1);
alter table public.vehicles add column if not exists power_hp        int;
alter table public.vehicles add column if not exists color           text;
alter table public.vehicles add column if not exists latitude        double precision;
alter table public.vehicles add column if not exists longitude       double precision;

do $$ begin
  alter table public.vehicles add constraint vehicles_estimated_value_positive
    check (estimated_value is null or estimated_value > 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.vehicles add constraint vehicles_power_hp_positive
    check (power_hp is null or power_hp > 0);
exception when duplicate_object then null; end $$;

-- PostgREST caches the schema; without this the API keeps reporting the
-- columns as missing until the next restart.
notify pgrst, 'reload schema';

-- Verify: should list all six.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'vehicles'
  and column_name in
    ('estimated_value', 'engine_size', 'power_hp', 'color', 'latitude', 'longitude')
order by column_name;
