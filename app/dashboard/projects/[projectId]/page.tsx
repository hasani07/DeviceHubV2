'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import { isDeviceOnline } from '@/lib/deviceStatus';

type Device = {
  id: string;
  device_id: string;
  api_key: string;
  name: string;
  power_mode: 'ac' | 'battery';
  status: 'online' | 'offline';
  last_seen: string | null;
  offline_threshold_minutes: number;
};

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState('');
  const [powerMode, setPowerMode] = useState<'ac' | 'battery'>('ac');
  const [interval, setInterval] = useState(300);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('project_id', params.projectId)
      .order('created_at', { ascending: false });
    if (data) setDevices(data);
  }

  function generateDeviceId() {
    return `dev-${crypto.randomUUID().slice(0, 8)}`;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    await supabase.from('devices').insert({
      project_id: params.projectId,
      device_id: generateDeviceId(),
      api_key: crypto.randomUUID(),
      name,
      power_mode: powerMode,
      checkin_interval_seconds: interval,
      offline_threshold_minutes: Math.max(5, Math.round((interval * 3) / 60)),
    });

    setName('');
    loadDevices();
  }

  return (
    <div className="space-y-6">
      <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300">
        ← Semua project
      </a>
      <h1 className="text-xl font-medium">Device</h1>

      <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama device, misal: Sensor Suhu 1"
          className="px-3 py-2 rounded bg-gray-900 border border-gray-800 flex-1 min-w-[200px]"
          required
        />
        <select
          value={powerMode}
          onChange={(e) => setPowerMode(e.target.value as 'ac' | 'battery')}
          className="px-3 py-2 rounded bg-gray-900 border border-gray-800"
        >
          <option value="ac">AC-powered</option>
          <option value="battery">Battery-powered</option>
        </select>
        <select
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="px-3 py-2 rounded bg-gray-900 border border-gray-800"
        >
          <option value={60}>Checkin tiap 1 menit</option>
          <option value={300}>Checkin tiap 5 menit</option>
          <option value={900}>Checkin tiap 15 menit</option>
          <option value={1800}>Checkin tiap 30 menit</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
          Tambah device
        </button>
      </form>

      <div className="space-y-2">
        {devices.map((d) => (
          <a
            key={d.id}
            href={`/dashboard/projects/${params.projectId}/devices/${d.device_id}`}
            className="flex justify-between items-center p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-600"
          >
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-gray-500">
                {d.device_id} · {d.power_mode}
              </div>
            </div>
            <DeviceStatusBadge
              status={isDeviceOnline(d.last_seen, d.offline_threshold_minutes) ? 'online' : 'offline'}
            />
          </a>
        ))}
        {devices.length === 0 && (
          <p className="text-gray-500 text-sm">Belum ada device, tambah dulu di atas.</p>
        )}
      </div>
    </div>
  );
}
