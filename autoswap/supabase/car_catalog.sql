create extension if not exists pg_trgm;

create table if not exists public.car_makes (
  id         bigint primary key,
  name       text not null,
  slug       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.car_makes add column if not exists is_active  boolean not null default true;
alter table public.car_makes add column if not exists created_at timestamptz not null default now();
alter table public.car_makes add column if not exists updated_at timestamptz not null default now();

create index if not exists car_makes_name_trgm
  on public.car_makes using gin (name gin_trgm_ops);

create table if not exists public.car_models (
  id         bigserial primary key,
  make_id    bigint not null references public.car_makes (id) on delete cascade,
  name       text not null,
  slug       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (make_id, name)
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

drop trigger if exists car_makes_set_updated_at on public.car_makes;
create trigger car_makes_set_updated_at before update on public.car_makes
  for each row execute function public.set_updated_at();

drop trigger if exists car_models_set_updated_at on public.car_models;
create trigger car_models_set_updated_at before update on public.car_models
  for each row execute function public.set_updated_at();

alter table public.car_makes  enable row level security;
alter table public.car_models enable row level security;

drop policy if exists car_makes_select  on public.car_makes;
drop policy if exists car_models_select on public.car_models;

create policy car_makes_select on public.car_makes for select using (is_active);
create policy car_models_select on public.car_models for select using (
  is_active
  and exists (select 1 from public.car_makes m where m.id = make_id and m.is_active)
);

grant select on public.car_makes  to anon, authenticated;
grant select on public.car_models to anon, authenticated;

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
