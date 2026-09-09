-- Jalankan ini di SQL Editor Supabase kalau tabel `devices` udah pernah dibuat.
-- Kalau belum pernah jalanin schema.sql sama sekali, gak perlu ini, karena
-- kolomnya udah ikut di schema.sql yang sudah diupdate.

alter table devices add column if not exists wifi_rssi integer;
