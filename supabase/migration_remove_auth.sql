-- Jalankan di SQL Editor Supabase kalau database lo masih pakai skema
-- versi lama (yang ada login/RLS/user_id). Ini buka akses jadi terbuka
-- buat siapapun yang tau URL dashboard, karena gak ada sistem login lagi.

-- 1. Matikan RLS di semua tabel
alter table projects disable row level security;
alter table devices disable row level security;
alter table logs disable row level security;
alter table commands disable row level security;

-- 2. Hapus policy lama (kalau ada)
drop policy if exists "user akses project sendiri" on projects;
drop policy if exists "user akses device di project sendiri" on devices;
drop policy if exists "user liat log device sendiri" on logs;
drop policy if exists "user kirim command ke device sendiri" on commands;

-- 3. Bikin user_id di projects jadi opsional (gak dipakai lagi, tapi
-- gak perlu didrop biar gak ganggu data yang udah ada)
alter table projects alter column user_id drop not null;
