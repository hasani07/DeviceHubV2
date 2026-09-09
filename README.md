# DeviceHub

Dashboard buat monitoring & kontrol banyak project ESP32 sekaligus.
Stack: Next.js + Supabase + Vercel.

## Cara setup

### 1. Bikin project Supabase
1. Buka [supabase.com](https://supabase.com), bikin project baru.
2. Masuk ke **SQL Editor**, copy-paste isi file `supabase/schema.sql`, jalankan.
3. Masuk ke **Project Settings > API**, catat:
   - `Project URL`
   - `anon public key`
   - `service_role key` (JANGAN pernah disebar/commit ke git)

### 2. Setup project lokal
```bash
npm install
cp .env.local.example .env.local
```
Isi `.env.local` dengan value dari Supabase di atas. `NEXT_PUBLIC_APP_URL` diisi nanti setelah deploy ke Vercel (buat sementara bisa isi `http://localhost:3000`).

### 3. Jalankan lokal
```bash
npm run dev
```
Buka `http://localhost:3000`, daftar akun baru (pakai email apa aja, gak perlu verifikasi kalau setting default Supabase).

### 4. Deploy ke Vercel
1. Push project ini ke GitHub.
2. Import repo di [vercel.com](https://vercel.com/new).
3. Isi Environment Variables yang sama seperti `.env.local` (termasuk `SUPABASE_SERVICE_ROLE_KEY`).
4. Setelah deploy, copy URL Vercel-nya (misal `https://esp32-dashboard.vercel.app`), taruh sebagai value `NEXT_PUBLIC_APP_URL` di Environment Variables, lalu redeploy.

### 5. Cara pakai
1. Buka dashboard (gak ada login, langsung masuk), buat project baru (misal "Greenhouse").
2. Masuk ke project itu, tambah device, pilih AC-powered atau Battery-powered.
3. Klik device yang baru dibuat, copy kode Arduino yang sudah otomatis keisi token.
4. Paste ke Arduino IDE, install library `WiFiManager` dan `ArduinoJson` lewat Library Manager, upload ke ESP32.
5. Pertama kali nyala, ESP32 buka hotspot `ESP32-Setup` — connect HP ke situ, pilih WiFi, isi password.
6. Device otomatis checkin ke dashboard, status berubah jadi "Online" dan log mulai muncul live.

## ⚠️ Catatan security (versi tanpa login)
Dashboard ini sengaja gak pakai login/auth. Siapapun yang tau URL Vercel-nya
bisa liat & ubah semua project, device, dan kirim command. Oke-oke aja
kalau URL cuma dishare ke orang yang dipercaya dan datanya gak sensitif.
Kalau nanti butuh proteksi minimal, opsinya: Vercel Password Protection
(fitur Pro plan), atau basic auth sederhana lewat `middleware.ts`.

## Struktur folder
```
app/
  login/                          -> halaman login/signup
  dashboard/                      -> halaman utama (perlu login)
    projects/[projectId]/         -> daftar device dalam 1 project
    projects/[projectId]/devices/[deviceId]/  -> detail device, live log, command
  api/ingest/                     -> endpoint yang dipanggil ESP32
  api/cron/check-offline/         -> dipanggil otomatis tiap 5 menit (lihat vercel.json)
components/
  LogViewer.tsx                   -> live log pakai Supabase Realtime
  CodeGenerator.tsx               -> generate kode Arduino otomatis
  DeviceStatusBadge.tsx
lib/supabase/
  client.ts                       -> dipakai di browser (anon key)
  server.ts                       -> dipakai di API routes doang (service role key)
supabase/schema.sql                -> jalankan sekali di SQL Editor Supabase
```

## Checkin interval (uptime)
Tiap device punya `checkin_interval_seconds` yang bisa diubah dari halaman
detail device di dashboard. Device gak perlu di-reflash — tiap checkin,
server balikin nilai interval yang lagi aktif, device otomatis pakai itu
buat siklus berikutnya. `offline_threshold_minutes` ikut ke-adjust otomatis
(3x interval) tapi tetap bisa diubah manual kalau perlu.

Status online/offline dihitung REAL-TIME di frontend (bandingkan `last_seen`
dengan `offline_threshold_minutes`), bukan lewat cron job. Ini sengaja,
karena Vercel Hobby plan cuma bolehin cron jalan 1x/hari — jadi gak
diandalkan buat status yang butuh update tiap beberapa menit.

## Catatan penting
- `SUPABASE_SERVICE_ROLE_KEY` bisa bypass semua RLS. Jangan pernah diimport di komponen `'use client'`, cuma boleh dipakai di `app/api/**`.
- Log otomatis kepotong ke 500 baris terakhir per device (trigger di database, lihat `schema.sql`), gak perlu maintenance manual.
- Command dari dashboard (restart, reset wifi) baru dieksekusi device pada checkin berikutnya, bukan instan — device polling, bukan push.
- Kalau nanti butuh command instan / kirim data lebih sering dari tiap beberapa menit, pertimbangkan tambah MQTT broker terpisah (di luar Vercel, misal Railway/EMQX Cloud), karena Vercel serverless gak bisa nahan koneksi persistent.
