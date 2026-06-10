-- =============================================================
-- AutoSwap — Storage (vehicle-photos bucket + object policies)
-- Run AFTER schema.sql (needs public.vehicles for the owner check).
--
-- Object path convention: vehicles/{vehicle_id}/{photo_id}.jpg
--   storage.foldername(name) -> {'vehicles', '<vehicle_id>'}
--   so (storage.foldername(name))[2] is the owning vehicle id.
--
-- Rules: public read, only the vehicle owner may upload / overwrite / delete.
-- =============================================================

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do update set public = excluded.public;

-- Helper: is auth.uid() the owner of the vehicle referenced by this object path?
create or replace function public.storage_owns_vehicle_object(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vehicles v
    where (storage.foldername(object_name))[1] = 'vehicles'
      and array_length(storage.foldername(object_name), 1) >= 2
      and v.id = ((storage.foldername(object_name))[2])::uuid
      and v.owner_id = auth.uid()
  );
$$;

-- Public read.
drop policy if exists vehicle_photos_read on storage.objects;
create policy vehicle_photos_read on storage.objects
  for select using (bucket_id = 'vehicle-photos');

-- Owner upload.
drop policy if exists vehicle_photos_upload on storage.objects;
create policy vehicle_photos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and public.storage_owns_vehicle_object(name)
  );

-- Owner overwrite (upsert).
drop policy if exists vehicle_photos_update on storage.objects;
create policy vehicle_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'vehicle-photos' and public.storage_owns_vehicle_object(name))
  with check (bucket_id = 'vehicle-photos' and public.storage_owns_vehicle_object(name));

-- Owner delete.
drop policy if exists vehicle_photos_delete on storage.objects;
create policy vehicle_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and public.storage_owns_vehicle_object(name)
  );
