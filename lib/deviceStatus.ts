// Dulu status online/offline disimpan di kolom `status` dan diupdate
// via cron job tiap beberapa menit. Tapi Vercel Hobby plan cuma bolehin
// cron jalan 1x/hari, jadi sekarang status dihitung langsung pas
// ditampilkan (real-time), berdasarkan last_seen vs offline_threshold.
// Gak butuh cron/background job sama sekali.

export function isDeviceOnline(lastSeen: string | null, offlineThresholdMinutes: number): boolean {
  if (!lastSeen) return false;
  const minutesSince = (Date.now() - new Date(lastSeen).getTime()) / 60000;
  return minutesSince <= offlineThresholdMinutes;
}
