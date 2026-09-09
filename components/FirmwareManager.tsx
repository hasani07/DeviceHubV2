'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Props = {
  deviceId: string;
  currentVersion: string;
  targetVersion: string | null;
  onPushed: () => void;
};

export default function FirmwareManager({ deviceId, currentVersion, targetVersion, onPushed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handlePush(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!file || !version) {
      setError('Pilih file .bin dan isi nomor versi dulu');
      return;
    }

    setUploading(true);
    try {
      const path = `${deviceId}/${version}.bin`;

      const { error: uploadError } = await supabase.storage
        .from('firmware')
        .upload(path, file, { upsert: true, contentType: 'application/octet-stream' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('firmware').getPublicUrl(path);

      await supabase
        .from('devices')
        .update({
          target_firmware_version: version,
          firmware_url: publicUrlData.publicUrl,
        })
        .eq('device_id', deviceId);

      setFile(null);
      setVersion('');
      onPushed();
      alert(`Update ke v${version} bakal diterapkan pas device checkin berikutnya.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload firmware');
    } finally {
      setUploading(false);
    }
  }

  const updatePending = targetVersion && targetVersion !== currentVersion;

  return (
    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900 space-y-3">
      <h2 className="text-sm text-gray-400">Firmware (OTA)</h2>
      <p className="text-xs text-gray-500">
        Versi yang lagi jalan di device: <span className="text-gray-300">{currentVersion}</span>
      </p>

      {updatePending && (
        <p className="text-xs text-yellow-400">
          Update ke v{targetVersion} menunggu diterima device pada checkin berikutnya.
        </p>
      )}

      <form onSubmit={handlePush} className="flex gap-2 flex-wrap items-center">
        <input
          type="file"
          accept=".bin"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-xs text-gray-400"
        />
        <input
          type="text"
          placeholder="Versi, misal 1.1.0"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="px-3 py-2 rounded bg-gray-950 border border-gray-800 text-sm w-32"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-50"
        >
          {uploading ? 'Mengupload...' : 'Push update'}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}

      <p className="text-xs text-gray-600">
        Compile firmware baru di Arduino IDE dengan FIRMWARE_VERSION yang dinaikkan sesuai versi
        di atas, export sebagai .bin (Sketch &gt; Export Compiled Binary), lalu upload di sini.
      </p>
    </div>
  );
}
