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
    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900 space-y-3">
      <h2 className="text-sm text-gray-400">Ganti WiFi (device online)</h2>
      <p className="text-xs text-gray-500">
        Kirim WiFi baru langsung tanpa perlu buka hotspot manual. Cuma efektif kalau device
        lagi online — kalau device offline/belum pernah connect, pakai tombol "Reset WiFi" di
        atas buat setup lewat hotspot.
      </p>

      {!isOnline && (
        <p className="text-xs text-yellow-500">
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
          className="px-3 py-2 rounded bg-gray-950 border border-gray-800 text-sm"
          required
        />
        <input
          type="password"
          placeholder="Password WiFi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 rounded bg-gray-950 border border-gray-800 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-50"
        >
          {sending ? 'Mengirim...' : 'Kirim WiFi baru'}
        </button>
      </form>

      <p className="text-xs text-gray-600">
        Catatan: password disimpan apa adanya (plaintext) di database, bukan terenkripsi.
        Karena dashboard ini gak pakai login, siapapun yang akses URL ini juga bisa lihat
        command yang tersimpan.
      </p>
    </div>
  );
}
