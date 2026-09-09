import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// CATATAN: endpoint ini sekarang OPSIONAL. Status online/offline udah
// dihitung real-time di frontend (lihat lib/deviceStatus.ts), gak
// bergantung ke kolom `status` lagi. File ini disisain kalau-kalau
// lo mau tetep sinkronin kolom `status` di database buat kebutuhan lain
// (misal query/export data), dan bisa dipanggil manual atau lewat
// Vercel Cron kalau lo upgrade ke plan yang bolehin cron lebih sering
// dari 1x/hari.

export async function GET() {
  const { data: devices } = await supabaseAdmin.from('devices').select('*');
  const now = Date.now();
  let updated = 0;

  for (const d of devices ?? []) {
    if (!d.last_seen || d.status === 'offline') continue;

    const minutesSince = (now - new Date(d.last_seen).getTime()) / 60000;
    if (minutesSince > d.offline_threshold_minutes) {
      await supabaseAdmin.from('devices').update({ status: 'offline' }).eq('id', d.id);
      updated++;
    }
  }

  return NextResponse.json({ checked: devices?.length ?? 0, marked_offline: updated });
}
