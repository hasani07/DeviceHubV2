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
    <div className="p-5 rounded-3xl glass-edge backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]">
      <h3 className="text-xs font-medium text-white/50 mb-2">Riwayat update firmware (3 terakhir)</h3>
      {history.length === 0 ? (
        <p className="text-xs text-white/30">Belum pernah update</p>
      ) : (
        <ul className="space-y-1.5">
          {history.map((h) => (
            <li key={h.id} className="text-xs text-white/50 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-violet-300/60" />
              <span className="text-white/80">v{h.version}</span>
              <span className="text-white/30">· {new Date(h.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
