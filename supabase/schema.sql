-- ============================================================
-- SKEMA: DeviceHub - dashboard multi-project ESP32
-- Versi INTERNAL tanpa login. Siapapun yang punya URL bisa akses
-- & ubah semua data, karena RLS dibuat permisif (gak ada auth.uid()
-- buat dicek, soalnya gak ada sistem login).
-- Jalankan di Supabase SQL Editor.
-- ============================================================

-- 1. PROJECTS
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 2. DEVICES
create table devices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  device_id text unique not null,
  api_key text unique not null,
  name text not null,
  power_mode text not null default 'ac' check (power_mode in ('ac', 'battery')),
  battery_level numeric,
  wifi_rssi integer,
  status text not null default 'offline' check (status in ('online', 'offline')),
  last_seen timestamptz,
  checkin_interval_seconds int not null default 300,
  offline_threshold_minutes int not null default 15,
  created_at timestamptz default now()
);

-- 3. LOGS
create table logs (
  id bigint generated always as identity primary key,
  device_id text references devices(device_id) on delete cascade not null,
  message text,
  data jsonb,
  created_at timestamptz default now()
);

create index idx_logs_device_created on logs (device_id, created_at desc);

create or replace function trim_device_logs()
returns trigger as $$
begin
  delete from logs
  where device_id = new.device_id
  and id not in (
    select id from logs
    where device_id = new.device_id
    order by created_at desc
    limit 500
  );
  return new;
end;
$$ language plpgsql;

create trigger after_log_insert
after insert on logs
for each row execute function trim_device_logs();

-- 4. COMMANDS
create table commands (
  id uuid primary key default gen_random_uuid(),
  device_id text references devices(device_id) on delete cascade not null,
  command text not null,
  payload jsonb,
  status text not null default 'pending' check (status in ('pending', 'delivered', 'done')),
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- Catatan: RLS SENGAJA tidak diaktifkan di sini karena gak ada sistem
-- login. Semua akses (baca/tulis) lewat anon key terbuka buat siapapun
-- yang tau URL dashboard-nya. Kalau nanti mau ditutup lagi pakai login,
-- perlu diaktifkan ulang RLS + kolom user_id di tabel projects.
