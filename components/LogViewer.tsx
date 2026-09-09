'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type LogRow = { id: number; message: string | null; data: any; created_at: string };

export default function LogViewer({ deviceId }: { deviceId: string }) {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [isLive, setIsLive] = useState(false);

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
    return () => {
      active = false;
    };
  }, [deviceId]);

  useEffect(() => {
    if (!isLive) return;

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
      supabase.removeChannel(channel);
    };
  }, [isLive, deviceId]);

  return (
    <div className="p-2 rounded-3xl glass-edge backdrop-blur-xl bg-white/[0.03] border border-white/[0.08]">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex rounded-full bg-white/[0.05] border border-white/[0.1] p-0.5">
          <button
            onClick={() => setIsLive(true)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              isLive ? 'bg-emerald-400/20 text-emerald-300' : 'text-white/40 hover:text-white/60'
            }`}
          >
            ▶ Run
          </button>
          <button
            onClick={() => setIsLive(false)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              !isLive ? 'bg-rose-400/20 text-rose-300' : 'text-white/40 hover:text-white/60'
            }`}
          >
            ■ Stop
          </button>
        </div>
        <span className="text-xs text-white/30">
          {isLive ? 'Live - update otomatis' : 'Stop - klik Run buat lanjut live'}
        </span>
      </div>

      <div className="rounded-2xl bg-black/60 p-3 h-80 overflow-y-auto font-mono text-xs text-emerald-300/90">
        {logs.length === 0 && <div className="text-white/25">Belum ada log masuk...</div>}
        {logs.map((log) => (
          <div key={log.id} className="whitespace-pre-wrap break-words">
            <span className="text-white/30">{new Date(log.created_at).toLocaleTimeString()}</span>{' '}
            {log.message}
            {log.data ? ' ' + JSON.stringify(log.data) : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
