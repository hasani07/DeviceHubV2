-- Jalankan di SQL Editor Supabase kalau database lo udah pernah dibuat.

create table if not exists wifi_history (
  id bigint generated always as identity primary key,
  device_id text references devices(device_id) on delete cascade not null,
  ssid text not null,
  created_at timestamptz default now()
);

create or replace function trim_wifi_history()
returns trigger as $$
begin
  delete from wifi_history
  where device_id = new.device_id
  and id not in (
    select id from wifi_history
    where device_id = new.device_id
    order by created_at desc
    limit 3
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists after_wifi_history_insert on wifi_history;
create trigger after_wifi_history_insert
after insert on wifi_history
for each row execute function trim_wifi_history();

create table if not exists firmware_history (
  id bigint generated always as identity primary key,
  device_id text references devices(device_id) on delete cascade not null,
  version text not null,
  created_at timestamptz default now()
);

create or replace function trim_firmware_history()
returns trigger as $$
begin
  delete from firmware_history
  where device_id = new.device_id
  and id not in (
    select id from firmware_history
    where device_id = new.device_id
    order by created_at desc
    limit 3
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists after_firmware_history_insert on firmware_history;
create trigger after_firmware_history_insert
after insert on firmware_history
for each row execute function trim_firmware_history();
