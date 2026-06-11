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
  id         bigint primary key,   -- vPIC MakeId (stable upstream id)
  name       text not null,
  slug       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Additive upgrade for deployments created before curation columns existed.
alter table public.car_makes add column if not exists is_active  boolean not null default true;
alter table public.car_makes add column if not exists created_at timestamptz not null default now();
alter table public.car_makes add column if not exists updated_at timestamptz not null default now();

-- GIN trigram index: powers `name ilike '%term%'` without a full scan.
create index if not exists car_makes_name_trgm
  on public.car_makes using gin (name gin_trgm_ops);

-- ---- Models ---------------------------------------------------------
create table if not exists public.car_models (
  id         bigserial primary key,
  make_id    bigint not null references public.car_makes (id) on delete cascade,
  name       text not null,
  slug       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (make_id, name)           -- upsert conflict target during ingest
);

alter table public.car_models add column if not exists is_active  boolean not null default true;
alter table public.car_models add column if not exists created_at timestamptz not null default now();
alter table public.car_models add column if not exists updated_at timestamptz not null default now();

create index if not exists car_models_make_idx
  on public.car_models (make_id);

create index if not exists car_models_name_trgm
  on public.car_models using gin (name gin_trgm_ops);

create index if not exists car_makes_active_idx  on public.car_makes (is_active);
create index if not exists car_models_active_idx on public.car_models (make_id, is_active);

-- updated_at bookkeeping (set_updated_at is defined in schema.sql, run first).
drop trigger if exists car_makes_set_updated_at on public.car_makes;
create trigger car_makes_set_updated_at before update on public.car_makes
  for each row execute function public.set_updated_at();

drop trigger if exists car_models_set_updated_at on public.car_models;
create trigger car_models_set_updated_at before update on public.car_models
  for each row execute function public.set_updated_at();

-- ---- Row Level Security: public read, no public write ---------------
alter table public.car_makes  enable row level security;
alter table public.car_models enable row level security;

drop policy if exists car_makes_select  on public.car_makes;
drop policy if exists car_models_select on public.car_models;

-- Only curated (active) catalog rows are visible to clients. Deactivated
-- makes hide all of their models regardless of the models' own flags.
create policy car_makes_select on public.car_makes for select using (is_active);
create policy car_models_select on public.car_models for select using (
  is_active
  and exists (select 1 from public.car_makes m where m.id = make_id and m.is_active)
);

grant select on public.car_makes  to anon, authenticated;
grant select on public.car_models to anon, authenticated;

-- ---- Admin curation (service-role only) ------------------------------
-- Soft enable/disable instead of deleting — listings keep their text values
-- and re-running the ingest script never resurrects a deactivated row
-- (the upsert payload does not include is_active).
create or replace function public.set_car_make_active(p_make_id bigint, p_active boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.car_makes set is_active = p_active where id = p_make_id;
$$;

create or replace function public.set_car_model_active(p_model_id bigint, p_active boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.car_models set is_active = p_active where id = p_model_id;
$$;

revoke all on function public.set_car_make_active(bigint, boolean)  from public, anon, authenticated;
revoke all on function public.set_car_model_active(bigint, boolean) from public, anon, authenticated;
grant execute on function public.set_car_make_active(bigint, boolean)  to service_role;
grant execute on function public.set_car_model_active(bigint, boolean) to service_role;
