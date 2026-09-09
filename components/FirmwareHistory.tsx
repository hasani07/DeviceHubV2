'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type FirmwareEvent = { id: number; version: string; created_at: string };

export default function FirmwareHistory({ deviceId }: { deviceId: string }) {
  const [history, setHistory] = useState<FirmwareEvent[]>([]);

  useEffect(() => {
    loadHistory();

    const channel = supabase
      .channel(`firmware-history-${deviceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'firmware_history', filter: `device_id=eq.${deviceId}` },
        () => loadHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  async function loadHistory() {
    const { data } = await supabase
      .from('firmware_history')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setHistory(data);
  }

  return (
    <div>
      <h3 className="text-xs text-gray-500 mb-1">Riwayat update firmware (3 terakhir)</h3>
      {history.length === 0 ? (
        <p className="text-xs text-gray-600">Belum pernah update</p>
      ) : (
        <ul className="space-y-1">
          {history.map((h) => (
            <li key={h.id} className="text-xs text-gray-400">
              <span className="text-gray-200">v{h.version}</span> ·{' '}
              {new Date(h.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
