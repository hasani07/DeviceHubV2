-- Jalankan di SQL Editor Supabase kalau tabel `devices` udah pernah dibuat sebelumnya.

alter table devices add column if not exists checkin_interval_seconds int not null default 300;
