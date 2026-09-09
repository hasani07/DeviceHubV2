import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Endpoint ini dipanggil ESP32 tiap siklus checkin (misal tiap 5 menit).
// Autentikasi pakai device_id + api_key (bukan Supabase Auth session),
// makanya harus pakai supabaseAdmin (service role) buat bypass RLS
// setelah validasi manual di bawah.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { device_id, api_key, message, data, battery_level, wifi_rssi } = body;

  if (!device_id || !api_key) {
    return NextResponse.json({ error: 'device_id dan api_key wajib diisi' }, { status: 400 });
  }

  // 1. Validasi device_id + api_key cocok
  const { data: device, error: deviceError } = await supabaseAdmin
    .from('devices')
    .select('*')
    .eq('device_id', device_id)
    .eq('api_key', api_key)
    .single();

  if (deviceError || !device) {
    return NextResponse.json({ error: 'device_id atau api_key salah' }, { status: 401 });
  }

  // 2. Simpan log (trigger di DB otomatis jaga cuma 500 baris terakhir)
  await supabaseAdmin.from('logs').insert({
    device_id,
    message: message ?? null,
    data: data ?? null,
  });

  // 3. Update status device jadi online + last_seen + battery kalau ada
  await supabaseAdmin
    .from('devices')
    .update({
      last_seen: new Date().toISOString(),
      status: 'online',
      battery_level: battery_level ?? device.battery_level,
      wifi_rssi: wifi_rssi ?? device.wifi_rssi,
    })
    .eq('device_id', device_id);

  // 4. Ambil command yang masih pending buat device ini
  const { data: pendingCommands } = await supabaseAdmin
    .from('commands')
    .select('*')
    .eq('device_id', device_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  // 5. Tandai delivered biar gak dikirim ulang siklus berikutnya
  if (pendingCommands && pendingCommands.length > 0) {
    await supabaseAdmin
      .from('commands')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .in('id', pendingCommands.map((c) => c.id));
  }

  return NextResponse.json({
    status: 'ok',
    commands: pendingCommands ?? [],
    // Device pakai nilai ini buat nentuin jadwal checkin berikutnya.
    // Jadi kalau lo ubah interval di dashboard, device auto-nyesuain
    // di siklus berikutnya, TANPA perlu upload ulang kode.
    checkin_interval_seconds: device.checkin_interval_seconds,
  });
}
