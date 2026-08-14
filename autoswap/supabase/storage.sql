insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-photos', 'vehicle-photos', true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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

drop policy if exists vehicle_photos_read on storage.objects;
create policy vehicle_photos_read on storage.objects
  for select using (bucket_id = 'vehicle-photos');

drop policy if exists vehicle_photos_upload on storage.objects;
create policy vehicle_photos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and public.storage_owns_vehicle_object(name)
  );

drop policy if exists vehicle_photos_update on storage.objects;
create policy vehicle_photos_update on storage.objects
  for update to authenticated
  using (bucket_id = 'vehicle-photos' and public.storage_owns_vehicle_object(name))
  with check (bucket_id = 'vehicle-photos' and public.storage_owns_vehicle_object(name));

drop policy if exists vehicle_photos_delete on storage.objects;
create policy vehicle_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and public.storage_owns_vehicle_object(name)
  );
