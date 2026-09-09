'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import LogViewer from '@/components/LogViewer';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import CodeGenerator from '@/components/CodeGenerator';
import WifiSignalBadge from '@/components/WifiSignalBadge';
import FirmwareManager from '@/components/FirmwareManager';
import WifiHistory from '@/components/WifiHistory';
import ChangeWifiForm from '@/components/ChangeWifiForm';
import FirmwareHistory from '@/components/FirmwareHistory';
import { isDeviceOnline } from '@/lib/deviceStatus';

type Device = {
  id: string;
  device_id: string;
  api_key: string;
  name: string;
  power_mode: 'ac' | 'battery';
  status: 'online' | 'offline';
  last_seen: string | null;
  battery_level: number | null;
  wifi_rssi: number | null;
  checkin_interval_seconds: number;
  offline_threshold_minutes: number;
  firmware_version: string;
  target_firmware_version: string | null;
};

export default function DeviceDetailPage({
  params,
}: {
  params: { projectId: string; deviceId: string };
}) {
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    loadDevice();
  }, []);

  async function loadDevice() {
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', params.deviceId)
      .single();
    if (data) setDevice(data);
  }

  async function sendCommand(command: string) {
    await supabase.from('commands').insert({ device_id: params.deviceId, command });
    alert(`Command "${command}" akan diterapkan pada checkin berikutnya.`);
  }

  async function updateInterval(seconds: number) {
    await supabase
      .from('devices')
      .update({
        checkin_interval_seconds: seconds,
        offline_threshold_minutes: Math.max(5, Math.round((seconds * 3) / 60)),
      })
      .eq('device_id', params.deviceId);
    loadDevice();
    alert('Interval diperbarui. Device bakal pakai jadwal baru mulai checkin berikutnya.');
  }

  if (!device) return <p className="text-gray-400">Memuat...</p>;

  const online = isDeviceOnline(device.last_seen, device.offline_threshold_minutes);
  const ingestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/ingest`;

  return (
    <div className="space-y-6">
      <a
        href={`/dashboard/projects/${params.projectId}`}
        className="text-sm text-gray-500 hover:text-gray-300"
      >
        ← Semua device
      </a>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-medium">{device.name}</h1>
        <DeviceStatusBadge status={online ? 'online' : 'offline'} />
        <WifiSignalBadge rssi={device.wifi_rssi} />
      </div>

      <p className="text-sm text-gray-500">
        Terakhir online: {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'belum pernah'}
        {device.power_mode === 'battery' && device.battery_level != null && (
          <> · Baterai: {device.battery_level.toFixed(1)}V</>
        )}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => sendCommand('restart')}
          className="px-3 py-2 rounded bg-red-950 text-red-300 text-sm border border-red-900"
        >
          Restart device
        </button>
        <button
          onClick={() => sendCommand('reset_wifi')}
          className="px-3 py-2 rounded bg-yellow-950 text-yellow-300 text-sm border border-yellow-900"
        >
          Reset WiFi
        </button>
      </div>

      <p className="text-xs text-gray-500">
        SSID & password WiFi diisi langsung di device (bukan di dashboard) — setelah restart
        atau reset wifi, device buka hotspot <span className="text-gray-300">ESP32-Setup</span>,
        connect HP ke situ buat pilih & isi WiFi. Kalau device lagi online, bisa juga pakai
        form di bawah buat ganti WiFi tanpa perlu hotspot.
      </p>

      <ChangeWifiForm deviceId={device.device_id} isOnline={online} />

      <WifiHistory deviceId={device.device_id} />

      <div className="p-4 rounded-lg border border-gray-800 bg-gray-900 space-y-2">
        <h2 className="text-sm text-gray-400">Checkin interval</h2>
        <p className="text-xs text-gray-500">
          Tiap berapa lama device wajib lapor. Ubah di sini gak perlu upload ulang kode —
          device otomatis pakai jadwal baru di checkin berikutnya.
        </p>
        <div className="flex items-center gap-2">
          <select
            value={device.checkin_interval_seconds}
            onChange={(e) => updateInterval(Number(e.target.value))}
            className="px-3 py-2 rounded bg-gray-950 border border-gray-800 text-sm"
          >
            <option value={60}>1 menit</option>
            <option value={300}>5 menit</option>
            <option value={900}>15 menit</option>
            <option value={1800}>30 menit</option>
            <option value={3600}>1 jam</option>
          </select>
          <span className="text-xs text-gray-500">
            Ditandai offline kalau diam &gt; {device.offline_threshold_minutes} menit
          </span>
        </div>
      </div>

      <FirmwareManager
        deviceId={device.device_id}
        currentVersion={device.firmware_version}
        targetVersion={device.target_firmware_version}
        onPushed={loadDevice}
      />

      <FirmwareHistory deviceId={device.device_id} />

      {device.power_mode === 'battery' && (
        <p className="text-xs text-gray-500">
          Device ini battery-powered, jadi command di atas baru dieksekusi pas device
          bangun & checkin berikutnya (bukan instan).
        </p>
      )}

      <div>
        <h2 className="text-sm text-gray-400 mb-2">Live log (500 baris terakhir)</h2>
        <LogViewer deviceId={device.device_id} />
      </div>

      <div>
        <h2 className="text-sm text-gray-400 mb-2">Kode Arduino untuk device ini</h2>
        <CodeGenerator
          deviceId={device.device_id}
          apiKey={device.api_key}
          powerMode={device.power_mode}
          ingestUrl={ingestUrl}
        />
      </div>
    </div>
  );
}
