'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Project = { id: string; name: string; created_at: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('projects').insert({ name });
    setName('');
    loadProjects();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project saya</h1>
        <p className="text-white/50 text-sm mt-1">Semua project ESP32 yang lagi lo pantau.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama project baru, misal: Greenhouse"
          className="flex-1 px-5 py-3 rounded-full glass-edge backdrop-blur-xl bg-white/[0.05] border border-white/[0.12] placeholder:text-white/30 outline-none focus:border-violet-300/50 transition-colors"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-full font-medium bg-gradient-to-r from-violet-500 to-cyan-400 text-white hover:opacity-90 transition-opacity shadow-glass"
        >
          Buat
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="p-5 rounded-3xl glass-edge backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all shadow-glass"
          >
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-white/40 mt-1">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
          </a>
        ))}
        {projects.length === 0 && (
          <p className="text-white/40 text-sm">Belum ada project, buat dulu di atas.</p>
        )}
      </div>
    </div>
  );
}
