'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type WifiEvent = { id: number; ssid: string; created_at: string };

export default function WifiHistory({ deviceId }: { deviceId: string }) {
  const [history, setHistory] = useState<WifiEvent[]>([]);

  useEffect(() => {
    loadHistory();

    // Subscribe biar riwayat langsung update kalau ada wifi baru disimpan
    const channel = supabase
      .channel(`wifi-history-${deviceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wifi_history', filter: `device_id=eq.${deviceId}` },
        () => loadHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  async function loadHistory() {
    const { data } = await supabase
      .from('wifi_history')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setHistory(data);
  }

  return (
    <div>
      <h3 className="text-xs text-gray-500 mb-1">Riwayat ganti WiFi (3 terakhir)</h3>
      {history.length === 0 ? (
        <p className="text-xs text-gray-600">Belum pernah ganti WiFi</p>
      ) : (
        <ul className="space-y-1">
          {history.map((h) => (
            <li key={h.id} className="text-xs text-gray-400">
              <span className="text-gray-200">{h.ssid}</span> ·{' '}
              {new Date(h.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
