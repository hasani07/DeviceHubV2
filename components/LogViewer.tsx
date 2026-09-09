'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type LogRow = { id: number; message: string | null; data: any; created_at: string };

export default function LogViewer({ deviceId }: { deviceId: string }) {
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(500);
      if (active && data) setLogs(data);
    }
    loadInitial();

    // Subscribe realtime: setiap ada log baru masuk, langsung muncul
    // tanpa refresh, ditaruh di paling atas.
    const channel = supabase
      .channel(`logs-${deviceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs', filter: `device_id=eq.${deviceId}` },
        (payload) => {
          setLogs((prev) => [payload.new as LogRow, ...prev].slice(0, 500));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  return (
    <div className="rounded-lg border border-gray-800 bg-black p-3 h-80 overflow-y-auto font-mono text-xs text-green-400">
      {logs.length === 0 && <div className="text-gray-600">Belum ada log masuk...</div>}
      {logs.map((log) => (
        <div key={log.id} className="whitespace-pre-wrap break-words">
          <span className="text-gray-600">{new Date(log.created_at).toLocaleTimeString()}</span>{' '}
          {log.message}
          {log.data ? ' ' + JSON.stringify(log.data) : ''}
        </div>
      ))}
    </div>
  );
}
