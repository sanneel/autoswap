-- ===================================================================
-- car_catalog.sql — canonical car makes & models for search/filtering.
--
-- Source data: NHTSA vPIC API, loaded by scripts/ingest-car-catalog.mjs.
-- Read-only to the public (anon) so the catalog powers the filter UI;
-- writes happen only via the service-role key during ingest.
--
-- Idempotent: safe to run multiple times.
-- ===================================================================

-- Trigram index support for fast case-insensitive "contains" (ILIKE) search.
create extension if not exists pg_trgm;

-- ---- Makes (brands) -------------------------------------------------
create table if not exists public.car_makes (
  id   bigint primary key,         -- vPIC MakeId (stable upstream id)
  name text not null,
  slug text not null
);

-- GIN trigram index: powers `name ilike '%term%'` without a full scan.
create index if not exists car_makes_name_trgm
  on public.car_makes using gin (name gin_trgm_ops);

-- ---- Models ---------------------------------------------------------
create table if not exists public.car_models (
  id      bigserial primary key,
  make_id bigint not null references public.car_makes (id) on delete cascade,
  name    text not null,
  slug    text not null,
  unique (make_id, name)           -- upsert conflict target during ingest
);

create index if not exists car_models_make_idx
  on public.car_models (make_id);

create index if not exists car_models_name_trgm
  on public.car_models using gin (name gin_trgm_ops);

-- ---- Row Level Security: public read, no public write ---------------
alter table public.car_makes  enable row level security;
alter table public.car_models enable row level security;

drop policy if exists car_makes_select  on public.car_makes;
drop policy if exists car_models_select on public.car_models;

create policy car_makes_select  on public.car_makes  for select using (true);
create policy car_models_select on public.car_models for select using (true);

grant select on public.car_makes  to anon, authenticated;
grant select on public.car_models to anon, authenticated;
