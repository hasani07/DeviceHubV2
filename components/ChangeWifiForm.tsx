'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Props = {
  deviceId: string;
  isOnline: boolean;
};

export default function ChangeWifiForm({ deviceId, isOnline }: Props) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ssid) return;

    setSending(true);
    await supabase.from('commands').insert({
      device_id: deviceId,
      command: 'change_wifi',
      payload: { ssid, password },
    });
    setSending(false);
    setSsid('');
    setPassword('');
    alert('WiFi baru bakal dicoba pas device checkin berikutnya.');
  }

  return (
    <div className="p-5 rounded-3xl glass-edge backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] space-y-3">
      <h2 className="text-sm font-medium text-white/70">Ganti WiFi (device online)</h2>
      <p className="text-xs text-white/40">
        Kirim WiFi baru langsung tanpa perlu buka hotspot manual. Cuma efektif kalau device
        lagi online — kalau device offline/belum pernah connect, pakai tombol "Reset WiFi" di
        atas buat setup lewat hotspot.
      </p>

      {!isOnline && (
        <p className="text-xs text-amber-300">
          Device lagi offline. Command tetap bisa dikirim & nunggu di antrian, tapi baru
          jalan kalau device online lagi.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Nama WiFi (SSID)"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.12] text-sm outline-none focus:border-violet-300/50 transition-colors"
          required
        />
        <input
          type="password"
          placeholder="Password WiFi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.12] text-sm outline-none focus:border-violet-300/50 transition-colors"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-violet-500 to-cyan-400 text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {sending ? 'Mengirim...' : 'Kirim WiFi baru'}
        </button>
      </form>

      <p className="text-xs text-white/30">
        Catatan: password disimpan apa adanya (plaintext) di database, bukan terenkripsi.
        Karena dashboard ini gak pakai login, siapapun yang akses URL ini juga bisa lihat
        command yang tersimpan.
      </p>
    </div>
  );
}
