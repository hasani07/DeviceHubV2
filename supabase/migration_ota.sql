-- Jalankan di SQL Editor Supabase kalau tabel `devices` udah pernah dibuat.

alter table devices add column if not exists firmware_version text not null default '1.0.0';
alter table devices add column if not exists target_firmware_version text;
alter table devices add column if not exists firmware_url text;

insert into storage.buckets (id, name, public)
values ('firmware', 'firmware', true)
on conflict (id) do nothing;

drop policy if exists "public read firmware" on storage.objects;
drop policy if exists "public upload firmware" on storage.objects;

create policy "public read firmware" on storage.objects
  for select using (bucket_id = 'firmware');

create policy "public upload firmware" on storage.objects
  for insert with check (bucket_id = 'firmware');
